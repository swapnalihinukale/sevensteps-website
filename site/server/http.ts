import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import type { EnquiryStore, NotificationSender } from './contracts.ts';
import { createTokenService } from './tokens.ts';
import { validateEnquiry } from './validation.ts';
import { createNotificationPayload } from './notification-payload.ts';
import { dispatchOne } from './notification-worker.ts';

export interface ApiDependencies {
  store: EnquiryStore;
  sender: NotificationSender;
  tokens: ReturnType<typeof createTokenService>;
  origin: string;
  from: string;
  to: string;
  rateKey: string;
  now?: () => number;
  diagnostic?: (code: string) => void;
}
const MAX_BODY = 65_536;
const WINDOW_MS = 10 * 60_000;
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
export const jsonResponse = (status: number, value: unknown, extra = {}) =>
  new Response(JSON.stringify(value), { status, headers: { ...headers, ...extra } });
export const unavailable = () => jsonResponse(503, {
  code: 'unavailable', message: 'Enquiries are unavailable. Please try again later.',
}, { 'Retry-After': '60' });

class RequestFailure extends Error {
  status: number;
  constructor(status: number) { super('Request rejected'); this.status = status; }
}
async function boundedJson(request: Request): Promise<unknown> {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') ?? '')) {
    throw new RequestFailure(415);
  }
  if (request.headers.has('content-encoding') && request.headers.get('content-encoding') !== 'identity') {
    throw new RequestFailure(415);
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new RequestFailure(413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestFailure(400);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let complete = false;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { reject(new RequestFailure(408)); void reader.cancel().catch(() => {}); }, 5_000);
    });
    const consume = async () => {
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        length += part.value.length;
        if (length > MAX_BODY) throw new RequestFailure(413);
        chunks.push(part.value);
      }
      const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
      return JSON.parse(text);
    };
    const value = await Promise.race([consume(), timeout]);
    complete = true;
    return value;
  } catch (error) {
    if (error instanceof RequestFailure) throw error;
    throw new RequestFailure(400);
  } finally {
    if (timer) clearTimeout(timer);
    if (!complete) void reader.cancel().catch(() => {});
  }
}

export function createEnquiryApi(deps: ApiDependencies) {
  const now = deps.now ?? Date.now;
  const diagnostic = (code: string) => { try { deps.diagnostic?.(code); } catch { /* Keep receipt truthful if logging fails. */ } };
  if (new URL(deps.origin).origin !== deps.origin || Buffer.byteLength(deps.rateKey) < 32) {
    throw new Error('Invalid API configuration');
  }
  return async (request: Request, context: { ip?: string }): Promise<Response> => {
    const url = new URL(request.url);
    const tokenRoute = url.pathname === '/api/enquiry-token';
    if (!tokenRoute && url.pathname !== '/api/enquiries') return jsonResponse(404, { code: 'not_found' });
    if (request.method !== (tokenRoute ? 'GET' : 'POST')) {
      return jsonResponse(405, { code: 'method_not_allowed' }, { Allow: tokenRoute ? 'GET' : 'POST' });
    }
    const origin = request.headers.get('origin');
    const site = request.headers.get('sec-fetch-site');
    if (url.origin !== deps.origin || url.search ||
      (origin !== null && origin !== deps.origin) || (!tokenRoute && origin !== deps.origin) ||
      (site !== null && site !== 'same-origin' && site !== 'none')) {
      return jsonResponse(403, { code: 'origin_rejected', message: 'Open the enquiry form on this website and try again.' });
    }
    // Only the adapter supplies a trusted address. Forwarded request headers are ignored.
    const ip = context.ip?.replace(/^::ffff:/, '');
    if (!ip || !isIP(ip)) return unavailable();
    try {
      const at = now();
      const hash = createHmac('sha256', deps.rateKey).update(`${Math.floor(at / 86_400_000)}:${ip}`).digest('hex');
      const route = tokenRoute ? 'token' : 'submission';
      for (const bucket of [
        { key: `${route}:global`, limit: tokenRoute ? 600 : 200 },
        { key: `${route}:${hash}`, limit: tokenRoute ? 60 : 30 },
      ]) {
        const key = createHmac('sha256', deps.rateKey).update(bucket.key).digest('hex');
        const limit = await deps.store.takeRateLimit({ ...bucket, key, windowMs: WINDOW_MS, now: at });
        if (!limit.allowed) return jsonResponse(429, {
          code: 'rate_limited', message: 'Too many attempts. Keep your details here and try again after a short wait.',
        }, { 'Retry-After': String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))) });
      }
      if (tokenRoute) {
        const issued = deps.tokens.issue(at);
        return jsonResponse(200, { token: issued.token, expiresAt: issued.claims.expiresAt });
      }
      let body: unknown;
      try { body = await boundedJson(request); }
      catch (error) {
        const status = error instanceof RequestFailure ? error.status : 400;
        return jsonResponse(status, { code: 'invalid_request', message: 'Check the form details and try again.' });
      }
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).some((key) => key !== 'token' && key !== 'enquiry')) {
        return jsonResponse(400, { code: 'invalid_request', message: 'Check the form details and try again.' });
      }
      const envelope = body as { token?: unknown; enquiry?: unknown };
      const claims = typeof envelope.token === 'string' ? deps.tokens.verify(envelope.token, now()) : null;
      if (!claims) return jsonResponse(409, {
        code: 'token_expired', message: 'This form has expired. Start a new enquiry only if you have not already sent one.',
      });
      const parsed = validateEnquiry(envelope.enquiry);
      if (!parsed.ok) return jsonResponse(422, { code: 'validation', errors: parsed.errors });
      const accepted = await deps.store.accept({
        tokenId: claims.id, formVersion: claims.formVersion,
        fingerprint: deps.tokens.fingerprint(parsed.value), enquiry: parsed.value,
        notification: createNotificationPayload(parsed.value, { from: deps.from, to: deps.to }), now: now(),
      });
      if (accepted.kind === 'conflict') return jsonResponse(409, {
        code: 'conflict', message: 'An enquiry with different details already uses this form. Check your earlier submission before starting another.',
      });
      if (accepted.kind === 'received') {
        try {
          await dispatchOne({ store: deps.store, sender: deps.sender, now,
            outboxId: accepted.outboxId, onDiagnostic: diagnostic });
        } catch { diagnostic('notification_dispatch_unavailable'); }
      }
      return jsonResponse(accepted.kind === 'received' ? 201 : 200, {
        code: 'received', receipt: accepted.receipt, message: 'We have received your enquiry.',
      });
    } catch {
      diagnostic('enquiry_storage_unavailable');
      return unavailable();
    }
  };
}
