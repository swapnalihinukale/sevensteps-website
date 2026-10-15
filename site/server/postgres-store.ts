import { randomUUID, timingSafeEqual } from 'node:crypto';
import { LEASE_MS, MAX_ATTEMPTS, REPAIR_INTERVAL_MS, RETRY_WINDOW_MS } from './contracts.ts';
import type { AcceptInput, AcceptResult, ClaimedNotification, EnquiryStore, NotificationEvent, NotificationOutcome, NotificationPayload } from './contracts.ts';

export interface PostgresResult {
  rows: Record<string, unknown>[];
  rowCount: number | null;
}
export interface PostgresClient {
  query(text: string, values?: unknown[]): Promise<PostgresResult>;
  release(destroy?: boolean): void;
}
/** Compatible with getDatabase().pool and pg.Pool; no global connection. */
export interface PostgresPool {
  connect(): Promise<PostgresClient>;
}

interface OutboxRow extends Record<string, unknown> {
  id: string;
  status: string;
  payload: NotificationPayload | null;
  provider_key: string;
  provider_id: string | null;
  first_attempt_at: Date | null;
  attempt_count: number;
  lease_owner: string | null;
  lease_until: Date | null;
  last_event_at: Date | null;
}
const terminals = new Set(['delivered', 'bounced', 'failed', 'complained']);
const timestamp = (value: number): Date => {
  if (!Number.isSafeInteger(value) || !Number.isFinite(new Date(value).getTime())) throw new Error('Invalid storage timestamp.');
  return new Date(value);
};
const millis = (value: Date | string): number => new Date(value).getTime();
const outcomeReasons = new Set([
  'provider_response_invalid', 'provider_timeout', 'provider_transport_error',
  'notification_state_invalid', 'notification_retry_window_exhausted', 'notification_key_invalid',
  'notification_work_deadline', 'provider_idempotency_conflict', 'provider_configuration_or_payload',
  'provider_temporary_error', 'provider_request_rejected', 'provider_cancelled',
  'notification_routing_changed', 'notification_payload_invalid', 'retry_window_exhausted', 'pii_deleted',
]);
const safeReason = (value: string): string => outcomeReasons.has(value) ? value : 'notification_state_invalid';
const equalFingerprint = (left: string, right: string): boolean => {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export class PostgresEnquiryStore implements EnquiryStore {
  private readonly pool: PostgresPool;
  constructor(pool: PostgresPool) { this.pool = pool; }

  private async transaction<T>(run: (client: PostgresClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL statement_timeout = '3s'; SET LOCAL lock_timeout = '2s'; SET LOCAL idle_in_transaction_session_timeout = '5s'");
      const result = await run(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { broken = true; }
      throw error;
    } finally { client.release(broken); }
  }

  async accept(input: AcceptInput): Promise<AcceptResult> {
    const now = timestamp(input.now);
    return this.transaction(async (client) => {
      const receipt = randomUUID(); const outboxId = randomUUID();
      const inserted = await client.query(`INSERT INTO enquiry_receipts
        (receipt, outbox_id, form_version, token_id, fingerprint, created_at, dedupe_until)
        VALUES ($1, $2, $3, $4, $5, $6, $6::timestamptz + interval '7 days')
        ON CONFLICT (form_version, token_id) DO NOTHING RETURNING receipt`,
      [receipt, outboxId, input.formVersion, input.tokenId, input.fingerprint, now]);
      if (!inserted.rowCount) {
        // The validator supplies the HMAC fingerprint. Notification changes on
        // retries cannot overwrite the original recipient or immutable payload.
        const existing = (await client.query(`SELECT receipt, outbox_id, fingerprint FROM enquiry_receipts
          WHERE form_version = $1 AND token_id = $2`, [input.formVersion, input.tokenId])).rows[0];
        if (!existing) throw new Error('Receipt disappeared during retry.');
        if (!equalFingerprint(String(existing.fingerprint), input.fingerprint)) return { kind: 'conflict' };
        return { kind: 'duplicate', receipt: String(existing.receipt), outboxId: String(existing.outbox_id) };
      }
      await client.query('INSERT INTO enquiries (receipt, payload) VALUES ($1, $2::jsonb)', [receipt, JSON.stringify(input.enquiry)]);
      await client.query(`INSERT INTO notification_outbox
        (id, receipt, payload, provider_key, created_at, next_attempt_at, updated_at)
        VALUES ($1, $2, $3::jsonb, $4, $5, $5, $5)`,
      [outboxId, receipt, JSON.stringify(input.notification), `enquiry-notification/${outboxId}`, now]);
      return { kind: 'received', receipt, outboxId };
    });
  }

  async claim(input: { id?: string; now: number; leaseOwner: string }): Promise<ClaimedNotification | null> {
    const now = timestamp(input.now);
    if (!input.leaseOwner || input.leaseOwner.length > 256) throw new Error('Invalid lease owner.');
    return this.transaction(async (client) => {
      // Bounded repair also covers a worker that crashed on its final attempt.
      await client.query(`WITH expired AS (
        SELECT id FROM notification_outbox WHERE ($1::text IS NULL OR id::text = $1)
          AND (status = 'pending' OR (status = 'sending' AND lease_until <= $2))
          AND first_attempt_at IS NOT NULL
          AND (attempt_count >= $3 OR first_attempt_at <= $2::timestamptz - $4 * interval '1 millisecond')
        ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 100)
        UPDATE notification_outbox o SET status = 'needs_reconciliation', lease_owner = NULL, lease_until = NULL,
          last_reason = 'retry_window_exhausted', updated_at = $2 FROM expired WHERE o.id = expired.id`,
      [input.id ?? null, now, MAX_ATTEMPTS, RETRY_WINDOW_MS]);
      const selected = await client.query(`SELECT * FROM notification_outbox
        WHERE ($1::text IS NULL OR id::text = $1) AND payload IS NOT NULL
          AND ((status = 'pending' AND next_attempt_at <= $2) OR (status = 'sending' AND lease_until <= $2))
          AND attempt_count < $3
          AND (first_attempt_at IS NULL OR first_attempt_at > $2::timestamptz - $4 * interval '1 millisecond')
        ORDER BY next_attempt_at, created_at, id FOR UPDATE SKIP LOCKED LIMIT 1`,
      [input.id ?? null, now, MAX_ATTEMPTS, RETRY_WINDOW_MS]);
      if (!selected.rowCount) return null;
      const row = selected.rows[0] as OutboxRow;
      const claimed = (await client.query(`UPDATE notification_outbox SET status = 'sending',
        first_attempt_at = COALESCE(first_attempt_at, $2), attempt_count = attempt_count + 1,
        lease_owner = $3, lease_until = $4, updated_at = $2 WHERE id = $1 RETURNING *`,
      [row.id, now, input.leaseOwner, timestamp(input.now + LEASE_MS)])).rows[0] as OutboxRow;
      return { id: claimed.id, leaseOwner: input.leaseOwner, payload: claimed.payload!,
        providerKey: claimed.provider_key, firstAttemptAt: millis(claimed.first_attempt_at!), attemptCount: claimed.attempt_count };
    });
  }

  private async lockProvider(client: PostgresClient, providerId: string): Promise<void> {
    // The webhook and send-completion paths take this lock in the same order.
    // Hash collisions only serialize unrelated IDs; they do not merge records.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended('enquiry-provider:' || $1, 0))", [providerId]);
  }

  private async applyEvents(client: PostgresClient, row: OutboxRow): Promise<void> {
    if (!row.provider_id) return;
    const result = await client.query(`SELECT event_type, occurred_at FROM notification_events WHERE provider_id = $1
      ORDER BY CASE WHEN event_type IN ('delivered', 'bounced', 'failed', 'complained') THEN 1 ELSE 0 END DESC,
        occurred_at DESC, CASE event_type WHEN 'complained' THEN 4 WHEN 'bounced' THEN 3 WHEN 'failed' THEN 2
        WHEN 'delivered' THEN 1 ELSE 0 END DESC, event_id DESC LIMIT 1`, [row.provider_id]);
    if (!result.rowCount) return;
    const event = result.rows[0]; const type = String(event.event_type);
    if (terminals.has(row.status) && !terminals.has(type)) return;
    if (row.last_event_at && millis(row.last_event_at) > millis(event.occurred_at as Date) && terminals.has(row.status)) return;
    const status = type === 'sent' ? 'accepted' : type;
    await client.query(`UPDATE notification_outbox SET status = $2, last_event_at = $3,
      lease_owner = NULL, lease_until = NULL, last_reason = CASE WHEN $2 IN ('failed', 'bounced', 'complained')
      THEN 'provider_' || $2 ELSE NULL END, updated_at = clock_timestamp() WHERE id = $1`, [row.id, status, event.occurred_at]);
  }

  async finish(input: { id: string; leaseOwner: string; outcome: NotificationOutcome; now: number }): Promise<boolean> {
    const now = timestamp(input.now);
    return this.transaction(async (client) => {
      if (input.outcome.kind === 'accepted') await this.lockProvider(client, input.outcome.providerId);
      const result = await client.query('SELECT * FROM notification_outbox WHERE id::text = $1 FOR UPDATE', [input.id]);
      if (!result.rowCount) return false;
      const row = result.rows[0] as OutboxRow;
      if (row.status !== 'sending' || row.lease_owner !== input.leaseOwner || !row.lease_until || millis(row.lease_until) <= input.now) return false;
      if (input.outcome.kind === 'accepted') {
        const updated = (await client.query(`UPDATE notification_outbox SET status = 'accepted', provider_id = $2,
          lease_owner = NULL, lease_until = NULL, last_reason = NULL, updated_at = $3 WHERE id = $1 RETURNING *`,
        [row.id, input.outcome.providerId, now])).rows[0] as OutboxRow;
        await this.applyEvents(client, updated);
        return true;
      }
      let status = input.outcome.kind === 'failed' ? 'failed' : 'needs_reconciliation';
      let nextAttempt = input.now;
      if (input.outcome.kind === 'retry') {
        const retryAfter = input.outcome.retryAfterMs ?? 0;
        if (!Number.isFinite(retryAfter) || retryAfter < 0) throw new Error('Invalid retry delay.');
        const deadline = millis(row.first_attempt_at!) + RETRY_WINDOW_MS;
        nextAttempt = Math.min(deadline, Math.max((Math.floor(input.now / REPAIR_INTERVAL_MS) + 1) * REPAIR_INTERVAL_MS, input.now + Math.ceil(retryAfter)));
        if (row.attempt_count < MAX_ATTEMPTS && nextAttempt < deadline) status = 'pending';
      }
      await client.query(`UPDATE notification_outbox SET status = $2, next_attempt_at = $3,
        lease_owner = NULL, lease_until = NULL, last_reason = $4, updated_at = $5 WHERE id = $1`,
      [row.id, status, timestamp(nextAttempt), safeReason(input.outcome.reason), now]);
      return true;
    });
  }

  async recordWebhook(event: NotificationEvent): Promise<'recorded' | 'duplicate' | 'unknown'> {
    const occurredAt = timestamp(event.occurredAt);
    return this.transaction(async (client) => {
      await this.lockProvider(client, event.providerId);
      const inserted = await client.query(`INSERT INTO notification_events (event_id, provider_id, event_type, occurred_at)
        VALUES ($1, $2, $3, $4) ON CONFLICT (event_id) DO NOTHING RETURNING event_id`, [event.id, event.providerId, event.type, occurredAt]);
      if (!inserted.rowCount) return 'duplicate';
      const matching = await client.query('SELECT * FROM notification_outbox WHERE provider_id = $1 FOR UPDATE', [event.providerId]);
      if (!matching.rowCount) return 'unknown';
      await this.applyEvents(client, matching.rows[0] as OutboxRow);
      return 'recorded';
    });
  }

  async takeRateLimit(input: { key: string; limit: number; windowMs: number; now: number }): Promise<{ allowed: boolean; retryAfterMs: number }> {
    timestamp(input.now);
    if (!/^[a-f0-9]{64}$/i.test(input.key) || !Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 1_000_000
      || !Number.isSafeInteger(input.windowMs) || input.windowMs < 1 || input.windowMs > 7 * 24 * 60 * 60 * 1000) throw new Error('Invalid rate limit configuration.');
    const start = Math.floor(input.now / input.windowMs) * input.windowMs;
    const expiry = start + input.windowMs;
    return this.transaction(async (client) => {
      // Prune a bounded batch. The operator runbook includes scheduled cleanup.
      await client.query(`WITH expired AS (SELECT key_hash, window_ms, bucket_start FROM enquiry_rate_limits
        WHERE expires_at <= $1 ORDER BY expires_at FOR UPDATE SKIP LOCKED LIMIT 100)
        DELETE FROM enquiry_rate_limits r USING expired e WHERE r.key_hash = e.key_hash
          AND r.window_ms = e.window_ms AND r.bucket_start = e.bucket_start`, [timestamp(input.now)]);
      const result = await client.query(`INSERT INTO enquiry_rate_limits (key_hash, window_ms, bucket_start, expires_at, hits)
        VALUES ($1, $2, $3, $4, 1) ON CONFLICT (key_hash, window_ms, bucket_start)
        DO UPDATE SET hits = LEAST(enquiry_rate_limits.hits + 1, $5 + 1) RETURNING hits`,
      [input.key.toLowerCase(), input.windowMs, timestamp(start), timestamp(expiry), input.limit]);
      const allowed = Number(result.rows[0].hits) <= input.limit;
      return { allowed, retryAfterMs: allowed ? 0 : expiry - input.now };
    });
  }
}
