import { Resend } from 'resend';
import type { NotificationEvent } from './contracts.ts';

export type WebhookHeaders = Headers | Record<string, string | undefined>;
export type VerifiedNotificationWebhook = NotificationEvent | { kind: 'ignored' } | null;
const MAX_BODY_BYTES = 64 * 1024;
const TOLERANCE_SECONDS = 300;
const providerIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const eventTypes: Record<string, NotificationEvent['type']> = {
  'email.sent': 'sent', 'email.delivered': 'delivered', 'email.bounced': 'bounced',
  'email.failed': 'failed', 'email.complained': 'complained', 'email.delivery_delayed': 'delivery_delayed',
  'email.suppressed': 'failed',
};
// Explicit dummy key avoids reading account credentials. Verification is local and never calls fetch.
const verifier = new Resend('webhook-verification-only', { baseUrl: 'https://api.resend.com' });
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

function headerValues(headers: WebhookHeaders): Record<string, string> | null {
  const entries = headers instanceof Headers ? [...headers.entries()] : Object.entries(headers);
  const normalized: Record<string, string> = Object.create(null);
  for (const [key, value] of entries) {
    if (value === undefined) continue;
    if (typeof value !== 'string' || Object.hasOwn(normalized, key.toLowerCase())) return null;
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function occurredAt(value: unknown): number | null {
  if (typeof value !== 'string' || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (year < 1970 || month < 1 || month > 12 || day < 1 || day > days || Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59) return null;
  const result = Date.parse(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}

export function verifyNotificationWebhook(rawBody: string, headers: WebhookHeaders, secret: string, now: () => number = Date.now): VerifiedNotificationWebhook {
  try {
    if (typeof rawBody !== 'string' || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES || typeof secret !== 'string' || !/^whsec_[a-zA-Z0-9+/]{40,}={0,2}$/.test(secret) || secret.length > 256) return null;
    const values = headerValues(headers);
    if (!values) return null;
    const read = (suffix: string) => {
      const svix = values[`svix-${suffix}`];
      const standard = values[`webhook-${suffix}`];
      if (svix && standard && svix !== standard) return undefined;
      return svix ?? standard;
    };
    const id = read('id');
    const timestamp = read('timestamp');
    const signature = read('signature');
    if (!id || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{7,199}$/.test(id) || !timestamp || !/^[1-9]\d{9,10}$/.test(timestamp) || !signature || signature.length > 2048) return null;
    const current = now();
    if (!Number.isFinite(current) || Math.abs(Math.floor(current / 1000) - Number(timestamp)) > TOLERANCE_SECONDS) return null;
    const event: unknown = verifier.webhooks.verify({ payload: rawBody, headers: { id, timestamp, signature }, webhookSecret: secret });
    if (!record(event) || typeof event.type !== 'string') return null;
    if (!Object.hasOwn(eventTypes, event.type)) return { kind: 'ignored' };
    if (!record(event.data) || typeof event.data.email_id !== 'string' || !providerIdPattern.test(event.data.email_id)) return null;
    const time = occurredAt(event.created_at);
    if (time === null || time > current + TOLERANCE_SECONDS * 1000) return null;
    return { id, providerId: event.data.email_id.toLowerCase(), type: eventTypes[event.type], occurredAt: time };
  } catch {
    return null;
  }
}
