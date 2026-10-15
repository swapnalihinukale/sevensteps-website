import { randomUUID } from 'node:crypto';
import { MAX_ATTEMPTS, RETRY_WINDOW_MS, type ClaimedNotification, type EnquiryStore, type NotificationOutcome, type NotificationSender } from './contracts.ts';

const PROVIDER_DEADLINE_MS = 4_000;
const WORK_BUDGET_MS = 20_000;
const MAX_PER_SWEEP = 4;
const providerIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export interface DispatchOptions {
  store: EnquiryStore;
  sender: NotificationSender;
  now?: () => number;
  outboxId?: string;
  deadlineMs?: number;
  onDiagnostic?: (code: string) => void;
}

function diagnostic(options: DispatchOptions, code: string) {
  try { options.onDiagnostic?.(code); } catch { /* Diagnostics cannot undo receipt or lease recovery. */ }
}

function safeOutcome(value: unknown): NotificationOutcome {
  if (!value || typeof value !== 'object') return { kind: 'retry', reason: 'provider_response_invalid' };
  const result = value as Record<string, unknown>;
  if (result.kind === 'accepted' && typeof result.providerId === 'string' && providerIdPattern.test(result.providerId)) {
    return { kind: 'accepted', providerId: result.providerId.toLowerCase() };
  }
  if (['retry', 'failed', 'reconcile'].includes(String(result.kind)) && typeof result.reason === 'string' && /^[a-z][a-z0-9_]{0,79}$/.test(result.reason)) {
    if (result.kind === 'retry') {
      const delay = result.retryAfterMs;
      return { kind: 'retry', reason: result.reason, ...(typeof delay === 'number' && Number.isFinite(delay) && delay >= 0 ? { retryAfterMs: delay } : {}) };
    }
    return { kind: result.kind as 'failed' | 'reconcile', reason: result.reason };
  }
  return { kind: 'retry', reason: 'provider_response_invalid' };
}

async function sendBounded(sender: NotificationSender, item: ClaimedNotification, milliseconds: number): Promise<NotificationOutcome> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<NotificationOutcome>(resolve => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ kind: 'retry', reason: 'provider_timeout' });
    }, milliseconds);
  });
  // A late result is observed by this promise but never saved after the race finishes.
  let sending: Promise<NotificationOutcome>;
  try {
    sending = Promise.resolve(sender.send(item, controller.signal)).then(safeOutcome).catch(() => ({ kind: 'retry', reason: 'provider_transport_error' }));
  } catch {
    sending = Promise.resolve({ kind: 'retry', reason: 'provider_transport_error' });
  }
  try { return await Promise.race([sending, timeout]); }
  finally { clearTimeout(timer); }
}

async function dispatch(options: DispatchOptions, mayStart: () => boolean): Promise<'idle' | 'processed'> {
  const now = options.now ?? Date.now;
  const claimed = await options.store.claim({ ...(options.outboxId ? { id: options.outboxId } : {}), now: now(), leaseOwner: randomUUID() });
  if (!claimed) return 'idle';
  const item = Object.freeze({ ...claimed, payload: Object.freeze({ ...claimed.payload }) });
  const current = now();
  let outcome: NotificationOutcome;
  const cutoff = item.firstAttemptAt + RETRY_WINDOW_MS;
  if (!Number.isFinite(item.firstAttemptAt) || item.firstAttemptAt > current || !Number.isInteger(item.attemptCount) || item.attemptCount < 1) {
    outcome = { kind: 'reconcile', reason: 'notification_state_invalid' };
  } else if (current >= cutoff || item.attemptCount > MAX_ATTEMPTS) {
    outcome = { kind: 'reconcile', reason: 'notification_retry_window_exhausted' };
  } else if (!/^[a-zA-Z0-9_-]{1,128}$/.test(item.id) || item.providerKey !== `enquiry-notification/${item.id}`) {
    outcome = { kind: 'reconcile', reason: 'notification_key_invalid' };
  } else if (!mayStart()) {
    outcome = { kind: 'retry', reason: 'notification_work_deadline' };
  } else {
    const requested = options.deadlineMs ?? PROVIDER_DEADLINE_MS;
    const selected = Number.isFinite(requested) && requested > 0 ? requested : PROVIDER_DEADLINE_MS;
    const timeout = Math.min(selected, PROVIDER_DEADLINE_MS, cutoff - current);
    outcome = await sendBounded(options.sender, item, timeout);
  }
  const finishedAt = now();
  if (outcome.kind === 'retry' && (finishedAt >= cutoff || item.attemptCount >= MAX_ATTEMPTS || finishedAt + (outcome.retryAfterMs ?? 0) >= cutoff)) {
    outcome = { kind: 'reconcile', reason: 'notification_retry_window_exhausted' };
  }
  try {
    const saved = await options.store.finish({ id: item.id, leaseOwner: item.leaseOwner, outcome, now: finishedAt });
    if (!saved) diagnostic(options, 'notification_lease_lost');
  } catch {
    // Leave the existing lease as the recovery authority. Receipt is already committed.
    diagnostic(options, 'notification_state_write_failed');
  }
  return 'processed';
}

export async function dispatchOne(options: DispatchOptions): Promise<'idle' | 'processed'> {
  return dispatch(options, () => true);
}

export interface RepairOptions extends Omit<DispatchOptions, 'outboxId' | 'deadlineMs'> { workBudgetMs?: number; }
export interface RepairSummary { processed: number; stopReason: 'idle' | 'limit' | 'deadline'; }

export async function repairNotifications(options: RepairOptions): Promise<RepairSummary> {
  const now = options.now ?? Date.now;
  const startedAt = now();
  const monotonicStart = performance.now();
  const requested = options.workBudgetMs ?? WORK_BUDGET_MS;
  const budget = Number.isFinite(requested) ? Math.max(0, Math.min(requested, WORK_BUDGET_MS)) : WORK_BUDGET_MS;
  const mayStart = () => now() - startedAt < budget && performance.now() - monotonicStart < budget;
  let processed = 0;
  while (processed < MAX_PER_SWEEP) {
    if (!mayStart()) return { processed, stopReason: 'deadline' };
    if (await dispatch(options, mayStart) === 'idle') return { processed, stopReason: 'idle' };
    processed += 1;
  }
  return { processed, stopReason: 'limit' };
}
