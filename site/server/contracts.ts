export const FORM_VERSION = 'enquiry-v1';
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const RETRY_WINDOW_MS = 22 * 60 * 60 * 1000;
export const REPAIR_INTERVAL_MS = 4 * 60 * 60 * 1000;
export const LEASE_MS = 90_000;
export const MAX_ATTEMPTS = 6;

export interface Enquiry {
  name: string;
  email: string;
  when: string;
  where: string;
  message: string;
  /** Optional portfolio context; validate its slug syntax before storage. */
  story: string;
}
export interface SubmissionToken {
  id: string;
  formVersion: string;
  issuedAt: number;
  expiresAt: number;
}
export interface NotificationPayload {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo: string;
}
export interface AcceptInput {
  tokenId: string;
  formVersion: string;
  fingerprint: string;
  enquiry: Enquiry;
  notification: NotificationPayload;
  now: number;
}
export type AcceptResult =
  | { kind: 'received' | 'duplicate'; receipt: string; outboxId: string }
  | { kind: 'conflict' };
export interface ClaimedNotification {
  id: string;
  leaseOwner: string;
  payload: NotificationPayload;
  providerKey: string;
  firstAttemptAt: number;
  attemptCount: number;
}
export type NotificationOutcome =
  | { kind: 'accepted'; providerId: string }
  | { kind: 'retry'; reason: string; retryAfterMs?: number }
  | { kind: 'failed'; reason: string }
  | { kind: 'reconcile'; reason: string };
export interface NotificationEvent {
  id: string;
  providerId: string;
  type: 'sent' | 'delivered' | 'bounced' | 'failed' | 'complained' | 'delivery_delayed';
  occurredAt: number;
}
export interface EnquiryStore {
  accept(input: AcceptInput): Promise<AcceptResult>;
  claim(input: { id?: string; now: number; leaseOwner: string }): Promise<ClaimedNotification | null>;
  finish(input: { id: string; leaseOwner: string; outcome: NotificationOutcome; now: number }): Promise<boolean>;
  recordWebhook(event: NotificationEvent): Promise<'recorded' | 'duplicate' | 'unknown'>;
  takeRateLimit(input: { key: string; limit: number; windowMs: number; now: number }): Promise<{ allowed: boolean; retryAfterMs: number }>;
}
export interface NotificationSender {
  send(item: ClaimedNotification, signal: AbortSignal): Promise<NotificationOutcome>;
}
