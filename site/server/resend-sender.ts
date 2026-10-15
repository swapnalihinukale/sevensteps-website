import { Resend, type CreateEmailOptions, type CreateEmailRequestOptions } from 'resend';
import { MAX_ATTEMPTS, RETRY_WINDOW_MS, type ClaimedNotification, type NotificationOutcome, type NotificationSender } from './contracts.ts';
import { normalizeEmailAddress } from './validation.ts';

export interface ResendClient {
  emails: { send(payload: CreateEmailOptions, options: CreateEmailRequestOptions): Promise<unknown> };
}
export interface ResendSenderOptions {
  apiKey: string;
  from: string;
  to: string;
  client?: ResendClient;
  now?: () => number;
}

const providerIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const terminalNames = new Set(['invalid_idempotency_key', 'validation_error', 'missing_api_key', 'restricted_api_key', 'invalid_api_key', 'not_found', 'method_not_allowed', 'invalid_attachment', 'invalid_from_address', 'invalid_access', 'invalid_parameter', 'invalid_region', 'missing_required_field', 'monthly_quota_exceeded', 'daily_quota_exceeded', 'security_error']);
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

function retryAfter(headers: unknown, now: number): number | undefined {
  if (!record(headers)) return;
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === 'retry-after')?.[1];
  if (typeof entry !== 'string' || entry.length > 128) return;
  if (/^\d+(?:\.\d+)?$/.test(entry)) {
    const delay = Number(entry) * 1_000;
    return Number.isFinite(delay) ? delay : undefined;
  }
  const timestamp = Date.parse(entry);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - now) : undefined;
}

function classify(response: unknown, now: number): NotificationOutcome {
  if (!record(response)) return { kind: 'retry', reason: 'provider_response_invalid' };
  if (response.error === null && record(response.data) && typeof response.data.id === 'string' && providerIdPattern.test(response.data.id)) {
    return { kind: 'accepted', providerId: response.data.id.toLowerCase() };
  }
  if (!record(response.error) || response.data !== null) return { kind: 'retry', reason: 'provider_response_invalid' };
  const error = response.error;
  const name = typeof error.name === 'string' ? error.name : '';
  const status = typeof error.statusCode === 'number' && Number.isInteger(error.statusCode) ? error.statusCode : null;
  if (name === 'invalid_idempotent_request') return { kind: 'reconcile', reason: 'provider_idempotency_conflict' };
  if (terminalNames.has(name)) return { kind: 'failed', reason: 'provider_configuration_or_payload' };
  if (name === 'concurrent_idempotent_requests' || name === 'rate_limit_exceeded' || status === 429 || (status !== null && status >= 500 && status <= 599) || (name === 'application_error' && status === null)) {
    const delay = retryAfter(response.headers, now);
    return { kind: 'retry', reason: 'provider_temporary_error', ...(delay === undefined ? {} : { retryAfterMs: delay }) };
  }
  if (status !== null && status >= 400 && status <= 499) return { kind: 'failed', reason: 'provider_request_rejected' };
  return { kind: 'retry', reason: 'provider_response_invalid' };
}

export class ResendSender implements NotificationSender {
  private readonly client: ResendClient;
  private readonly from: string;
  private readonly to: string;
  private readonly now: () => number;

  constructor(options: ResendSenderOptions) {
    const from = normalizeEmailAddress(options.from);
    const to = normalizeEmailAddress(options.to);
    if (!options.apiKey || /\s/.test(options.apiKey) || !from || !to) throw new Error('Invalid notification sender configuration');
    // The pinned SDK logs raw provider errors outside production; fake clients need no environment change.
    if (!options.client && process.env.NODE_ENV !== 'production') throw new Error('Real notification sending requires production runtime logging safeguards');
    this.client = options.client ?? new Resend(options.apiKey, { baseUrl: 'https://api.resend.com', userAgent: 'seven-steps-enquiry' });
    this.from = from;
    this.to = to;
    this.now = options.now ?? Date.now;
  }

  async send(item: ClaimedNotification, signal: AbortSignal): Promise<NotificationOutcome> {
    if (signal.aborted) return { kind: 'retry', reason: 'provider_cancelled' };
    const current = this.now();
    if (!Number.isFinite(item.firstAttemptAt) || item.firstAttemptAt > current || !Number.isInteger(item.attemptCount) || item.attemptCount < 1) return { kind: 'reconcile', reason: 'notification_state_invalid' };
    if (current >= item.firstAttemptAt + RETRY_WINDOW_MS || item.attemptCount > MAX_ATTEMPTS) return { kind: 'reconcile', reason: 'notification_retry_window_exhausted' };
    if (item.providerKey !== `enquiry-notification/${item.id}` || !/^[a-zA-Z0-9_-]{1,128}$/.test(item.id)) return { kind: 'reconcile', reason: 'notification_key_invalid' };
    const payload = item.payload;
    if (payload.from !== this.from || payload.to !== this.to) return { kind: 'reconcile', reason: 'notification_routing_changed' };
    if (!normalizeEmailAddress(payload.replyTo) || typeof payload.subject !== 'string' || payload.subject.length < 1 || payload.subject.length > 200 || /[\r\n\u0000]/.test(payload.subject) || typeof payload.text !== 'string' || payload.text.length < 1 || payload.text.length > 20_000 || payload.text.includes('\u0000')) {
      return { kind: 'failed', reason: 'notification_payload_invalid' };
    }
    try {
      const response = await this.client.emails.send({ from: payload.from, to: payload.to, subject: payload.subject, text: payload.text, replyTo: payload.replyTo }, { idempotencyKey: item.providerKey, signal });
      return classify(response, this.now());
    } catch {
      return { kind: 'retry', reason: signal.aborted ? 'provider_cancelled' : 'provider_transport_error' };
    }
  }
}
