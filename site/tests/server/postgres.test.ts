import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { Pool } from 'pg';
import { LEASE_MS, MAX_ATTEMPTS, REPAIR_INTERVAL_MS, RETRY_WINDOW_MS } from '../../server/contracts.ts';
import { PostgresEnquiryStore } from '../../server/postgres-store.ts';
import { postgresFixture, submission, testDatabaseUrl } from './postgres-fixture.ts';

describe('PostgreSQL enquiry store', { skip: !testDatabaseUrl ? 'SEVENSTEPS_TEST_DATABASE_URL is required for real PostgreSQL tests' : false }, () => {
  let fixture: Awaited<ReturnType<typeof postgresFixture>>;
  before(async () => { fixture = await postgresFixture(); });
  afterEach(async () => { await fixture.clear(); });
  after(async () => { await fixture.close(); });
  const row = async (id: string) => (await fixture.pool.query('SELECT * FROM notification_outbox WHERE id = $1', [id])).rows[0];
  async function accepted(now?: number) {
    const input = submission(now); const result = await fixture.store.accept(input);
    assert.equal(result.kind, 'received'); assert.ok('outboxId' in result);
    return { input, result };
  }
  async function claimed(now?: number) {
    const { input, result } = await accepted(now);
    const item = await fixture.store.claim({ id: result.outboxId, now: input.now, leaseOwner: 'worker-a' });
    assert.ok(item); return { input, result, item };
  }

  test('receipt, enquiry and immutable outbox commit together; duplicate keeps original payload', async () => {
    const { input, result } = await accepted();
    assert.match(result.receipt, /^[0-9a-f-]{36}$/);
    assert.notEqual(result.receipt, result.outboxId);
    const duplicate = await fixture.store.accept({ ...input, notification: { ...input.notification, to: 'changed@example.test' } });
    assert.deepEqual(duplicate, { ...result, kind: 'duplicate' });
    assert.equal((await row(result.outboxId)).payload.to, 'operator@example.test');
    assert.equal((await fixture.pool.query('SELECT count(*) FROM enquiries')).rows[0].count, '1');
    await assert.rejects(fixture.pool.query("UPDATE notification_outbox SET payload = '{\"text\":\"changed\"}' WHERE id = $1", [result.outboxId]), /immutable/);
  });

  test('outbox insert failure rolls back receipt and enquiry on the same connection', async () => {
    await fixture.pool.query(`CREATE FUNCTION reject_test_outbox() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic outbox fault'; END $$;
      CREATE TRIGGER reject_test_outbox BEFORE INSERT ON notification_outbox FOR EACH ROW EXECUTE FUNCTION reject_test_outbox();`);
    try {
      await assert.rejects(fixture.store.accept(submission()), /synthetic outbox fault/);
      for (const table of ['enquiry_receipts', 'enquiries', 'notification_outbox']) {
        assert.equal((await fixture.pool.query(`SELECT count(*) FROM ${table}`)).rows[0].count, '0');
      }
    } finally { await fixture.pool.query('DROP TRIGGER reject_test_outbox ON notification_outbox; DROP FUNCTION reject_test_outbox()'); }
    assert.equal((await fixture.store.accept(submission())).kind, 'received');
  });

  test('concurrent duplicates produce one record and changed HMAC returns conflict', async () => {
    const input = submission();
    const results = await Promise.all(Array.from({ length: 12 }, () => fixture.store.accept(input)));
    assert.equal(results.filter(x => x.kind === 'received').length, 1);
    assert.equal(results.filter(x => x.kind === 'duplicate').length, 11);
    assert.equal(new Set(results.filter(x => 'receipt' in x).map(x => x.receipt)).size, 1);
    const changed = { ...input.enquiry, message: 'A different synthetic message' };
    const fingerprint = createHmac('sha256', 'synthetic-test-key').update(JSON.stringify(changed)).digest('hex');
    assert.deepEqual(await fixture.store.accept({ ...input, enquiry: changed, fingerprint }), { kind: 'conflict' });
    assert.equal((await fixture.pool.query('SELECT count(*) FROM notification_outbox')).rows[0].count, '1');
  });

  test('concurrent changed payloads race to one winner and one conflict', async () => {
    const input = submission();
    const outcomes = await Promise.all([fixture.store.accept(input), fixture.store.accept({ ...input, fingerprint: 'different-test-hmac' })]);
    assert.deepEqual(outcomes.map(x => x.kind).sort(), ['conflict', 'received']);
  });

  test('concurrent claimers lease each due row once and persist first attempt before sending', async () => {
    const { input, result } = await accepted();
    const claims = await Promise.all(Array.from({ length: 8 }, (_, i) => fixture.store.claim({ now: input.now, leaseOwner: `worker-${i}` })));
    assert.equal(claims.filter(Boolean).length, 1);
    const stored = await row(result.outboxId);
    assert.equal(stored.status, 'sending'); assert.equal(stored.attempt_count, 1);
    assert.equal(stored.first_attempt_at.getTime(), input.now);
    assert.equal(stored.lease_until.getTime(), input.now + LEASE_MS);
  });

  test('SKIP LOCKED claims a second row while the first row is locked', async () => {
    const first = await accepted(); const second = await accepted(first.input.now + 1);
    const client = await fixture.pool.connect();
    try {
      await client.query('BEGIN'); await client.query('SELECT id FROM notification_outbox WHERE id = $1 FOR UPDATE', [first.result.outboxId]);
      const claim = await fixture.store.claim({ now: second.input.now, leaseOwner: 'other' });
      assert.equal(claim?.id, second.result.outboxId);
    } finally { await client.query('ROLLBACK'); client.release(); }
  });

  test('expired lease recovers with the original provider key; stale owner cannot finish', async () => {
    const { input, item } = await claimed();
    assert.equal(await fixture.store.claim({ id: item.id, now: input.now + LEASE_MS - 1, leaseOwner: 'worker-b' }), null);
    const reclaimed = await fixture.store.claim({ id: item.id, now: input.now + LEASE_MS, leaseOwner: 'worker-b' });
    assert.ok(reclaimed); assert.equal(reclaimed.attemptCount, 2); assert.equal(reclaimed.providerKey, item.providerKey);
    assert.equal(reclaimed.firstAttemptAt, item.firstAttemptAt);
    assert.equal(await fixture.store.finish({ id: item.id, leaseOwner: 'worker-a', now: input.now + LEASE_MS + 1, outcome: { kind: 'accepted', providerId: 'stale-provider' } }), false);
    assert.equal(await fixture.store.finish({ id: item.id, leaseOwner: 'worker-b', now: input.now + LEASE_MS + 1, outcome: { kind: 'accepted', providerId: 'real-provider' } }), true);
    assert.equal(await fixture.store.claim({ id: item.id, now: input.now + 10 * LEASE_MS, leaseOwner: 'worker-c' }), null);
  });

  test('expired owner cannot finish even before a replacement worker claims', async () => {
    const { input, item } = await claimed();
    assert.equal(await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + LEASE_MS, outcome: { kind: 'failed', reason: 'expired' } }), false);
    assert.equal((await row(item.id)).status, 'sending');
  });

  test('retry eligibility uses the next UTC four-hour boundary and respects Retry-After', async () => {
    const { input, item } = await claimed(Date.UTC(2026, 9, 15, 3, 59, 30));
    const due = Date.UTC(2026, 9, 15, 4);
    await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 1, outcome: { kind: 'retry', reason: 'timeout' } });
    assert.equal((await row(item.id)).next_attempt_at.getTime(), due);
    assert.equal(await fixture.store.claim({ id: item.id, now: due - 1, leaseOwner: 'early' }), null);
    const next = await fixture.store.claim({ id: item.id, now: due, leaseOwner: 'on-time' }); assert.ok(next);
    await fixture.store.finish({ id: item.id, leaseOwner: next.leaseOwner, now: due, outcome: { kind: 'retry', reason: 'rate_limited', retryAfterMs: 5 * 60 * 60 * 1000 } });
    assert.equal((await row(item.id)).next_attempt_at.getTime(), due + 5 * 60 * 60 * 1000);
    assert.equal(await fixture.store.claim({ id: item.id, now: due, leaseOwner: 'same-sweep' }), null);
  });

  test('six attempts exhaust into reconciliation and cannot send again', async () => {
    const { input, result } = await accepted();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const now = input.now + i * REPAIR_INTERVAL_MS;
      const item = await fixture.store.claim({ id: result.outboxId, now, leaseOwner: `attempt-${i}` }); assert.ok(item);
      assert.equal(item.attemptCount, i + 1);
      await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now, outcome: { kind: 'retry', reason: 'unknown_timeout' } });
    }
    assert.equal((await row(result.outboxId)).status, 'needs_reconciliation');
    assert.equal(await fixture.store.claim({ id: result.outboxId, now: input.now + 24 * 60 * 60 * 1000, leaseOwner: 'too-late' }), null);
  });

  test('22-hour cutoff repairs an abandoned lease without another provider attempt', async () => {
    const { input, item } = await claimed();
    assert.equal(await fixture.store.claim({ id: item.id, now: input.now + RETRY_WINDOW_MS, leaseOwner: 'late' }), null);
    const stored = await row(item.id); assert.equal(stored.status, 'needs_reconciliation'); assert.equal(stored.attempt_count, 1);
  });

  test('a crash on the sixth attempt reaches reconciliation when the lease expires', async () => {
    const { input, result } = await accepted();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      assert.ok(await fixture.store.claim({ id: result.outboxId, now: input.now + i * LEASE_MS, leaseOwner: `crash-${i}` }));
    }
    assert.equal(await fixture.store.claim({ id: result.outboxId, now: input.now + MAX_ATTEMPTS * LEASE_MS, leaseOwner: 'seventh' }), null);
    assert.equal((await row(result.outboxId)).status, 'needs_reconciliation');
    assert.equal((await row(result.outboxId)).attempt_count, MAX_ATTEMPTS);
  });

  test('Retry-After outside the provider window goes to reconciliation', async () => {
    const { input, item } = await claimed();
    await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 1,
      outcome: { kind: 'retry', reason: 'rate_limit', retryAfterMs: 24 * 60 * 60 * 1000 } });
    assert.equal((await row(item.id)).status, 'needs_reconciliation');
    assert.equal((await row(item.id)).next_attempt_at.getTime(), input.now + RETRY_WINDOW_MS);
  });

  test('extreme finite Retry-After is bounded by the stored provider deadline', async () => {
    const { input, item } = await claimed();
    assert.equal(await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 1,
      outcome: { kind: 'retry', reason: 'rate_limit', retryAfterMs: Number.MAX_VALUE } }), true);
    assert.equal((await row(item.id)).status, 'needs_reconciliation');
    assert.equal((await row(item.id)).next_attempt_at.getTime(), input.now + RETRY_WINDOW_MS);
  });

  test('permanent failure stores only a safe reason and cannot re-enter delivery', async () => {
    const { input, item } = await claimed();
    await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 1,
      outcome: { kind: 'failed', reason: 'unsafe provider echo synthetic@example.test' } });
    assert.equal((await row(item.id)).last_reason, 'notification_state_invalid');
    assert.equal(await fixture.store.claim({ now: input.now + REPAIR_INTERVAL_MS, leaseOwner: 'next' }), null);
  });

  test('webhook before send completion is retained and reconciled on provider association', async () => {
    const { input, item } = await claimed();
    const event = { id: 'early-event', providerId: 'mail-early', type: 'delivered' as const, occurredAt: input.now + 10 };
    assert.equal(await fixture.store.recordWebhook(event), 'unknown');
    await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 20, outcome: { kind: 'accepted', providerId: event.providerId } });
    assert.equal((await row(item.id)).status, 'delivered');
    assert.equal(await fixture.store.recordWebhook(event), 'duplicate');
    const columns = Object.keys((await fixture.pool.query('SELECT * FROM notification_events')).rows[0]).sort();
    assert.deepEqual(columns, ['event_id', 'event_type', 'occurred_at', 'provider_id', 'received_at']);
  });

  test('webhook racing send completion cannot lose a delivery event', async () => {
    for (let i = 0; i < 5; i++) {
      const { input, item } = await claimed(); const providerId = `mail-race-${i}`;
      await Promise.all([
        fixture.store.recordWebhook({ id: `race-${i}`, providerId, type: 'delivered', occurredAt: input.now + 5 }),
        fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now + 10, outcome: { kind: 'accepted', providerId } }),
      ]);
      assert.equal((await row(item.id)).status, 'delivered');
    }
  });

  test('terminal webhook results resist late sent/delayed and older terminal events', async () => {
    const { input, item } = await claimed(); const providerId = 'ordered-mail';
    await fixture.store.finish({ id: item.id, leaseOwner: item.leaseOwner, now: input.now, outcome: { kind: 'accepted', providerId } });
    for (const [id, type, delta] of [['delivered', 'delivered', 20], ['late-sent', 'sent', 30], ['older-failed', 'failed', 10], ['late-delay', 'delivery_delayed', 40]] as const) {
      await fixture.store.recordWebhook({ id, providerId, type, occurredAt: input.now + delta });
    }
    assert.equal((await row(item.id)).status, 'delivered');
    await fixture.store.recordWebhook({ id: 'bounced', providerId, type: 'bounced', occurredAt: input.now + 50 });
    await fixture.store.recordWebhook({ id: 'old-delivery', providerId, type: 'delivered', occurredAt: input.now + 45 });
    assert.equal((await row(item.id)).status, 'bounced');
  });

  test('fixed-bucket rate limiting is atomic, expires at boundary and bounds stored hits', async () => {
    const key = 'a'.repeat(64); const now = Date.UTC(2026, 9, 15);
    const results = await Promise.all(Array.from({ length: 16 }, () => fixture.store.takeRateLimit({ key, limit: 3, windowMs: 60_000, now })));
    assert.equal(results.filter(x => x.allowed).length, 3);
    assert.ok(results.filter(x => !x.allowed).every(x => x.retryAfterMs === 60_000));
    assert.equal((await fixture.pool.query('SELECT hits FROM enquiry_rate_limits')).rows[0].hits, 4);
    assert.deepEqual(await fixture.store.takeRateLimit({ key, limit: 3, windowMs: 60_000, now: now + 60_000 }), { allowed: true, retryAfterMs: 0 });
    assert.equal((await fixture.pool.query('SELECT count(*) FROM enquiry_rate_limits')).rows[0].count, '1');
    await assert.rejects(fixture.store.takeRateLimit({ key: 'raw-address', limit: 3, windowMs: 60_000, now }), /Invalid rate limit/);
  });

  test('PII deletion clears both payloads but preserves dedup for at least seven further days', async () => {
    const { input, result } = await accepted(Date.now());
    await fixture.pool.query('SELECT purge_enquiry_pii($1)', [result.receipt]);
    assert.equal((await fixture.pool.query('SELECT count(*) FROM enquiries')).rows[0].count, '0');
    assert.equal((await row(result.outboxId)).payload, null);
    const receipt = (await fixture.pool.query('SELECT * FROM enquiry_receipts WHERE receipt = $1', [result.receipt])).rows[0];
    assert.ok(receipt.dedupe_until.getTime() - receipt.pii_deleted_at.getTime() >= 7 * 24 * 60 * 60 * 1000 - 1);
    assert.deepEqual(await fixture.store.accept(input), { kind: 'duplicate', receipt: result.receipt, outboxId: result.outboxId });
    await assert.rejects(fixture.pool.query('DELETE FROM enquiry_receipts WHERE receipt = $1', [result.receipt]), /retention/);
    assert.equal(await fixture.store.claim({ now: input.now + LEASE_MS, leaseOwner: 'after-purge' }), null);
  });

  test('active lease prevents retention deletion until the claim expires', async () => {
    const { result } = await claimed(Date.now());
    await assert.rejects(fixture.pool.query('SELECT purge_enquiry_pii($1)', [result.receipt]), /active notification lease/);
    assert.equal((await fixture.pool.query('SELECT count(*) FROM enquiries')).rows[0].count, '1');
  });

  test('operator views expose received enquiries and recovery without token/fingerprint fields', async () => {
    await fixture.pool.query(await readFile(new URL('../../server/operator-views.sql', import.meta.url), 'utf8'));
    await accepted();
    const inbox = (await fixture.pool.query('SELECT * FROM enquiry_operator_inbox')).rows[0];
    assert.equal(inbox.name, 'Test Couple'); assert.ok(!('token_id' in inbox)); assert.ok(!('fingerprint' in inbox));
    assert.equal((await fixture.pool.query('SELECT count(*) FROM enquiry_operator_recovery')).rows[0].count, '1');
  });

  test('runtime and operator role grants enforce their separate capabilities', async () => {
    const schema = fixture.schema; const runtime = `${schema}_runtime`; const operator = `${schema}_operator`;
    await fixture.pool.query(await readFile(new URL('../../server/operator-views.sql', import.meta.url), 'utf8'));
    await fixture.pool.query(`CREATE ROLE ${runtime}; CREATE ROLE ${operator};
      GRANT USAGE ON SCHEMA ${schema} TO ${runtime}, ${operator};
      GRANT SELECT, INSERT ON enquiry_receipts, enquiries, notification_outbox, notification_events TO ${runtime};
      GRANT UPDATE (provider_id, status, next_attempt_at, first_attempt_at, attempt_count, lease_owner, lease_until,
        last_reason, last_event_at, updated_at) ON notification_outbox TO ${runtime};
      GRANT SELECT, INSERT, UPDATE, DELETE ON enquiry_rate_limits TO ${runtime};
      GRANT SELECT ON enquiry_operator_inbox, enquiry_operator_recovery TO ${operator};`);
    const runtimePool = new Pool({ connectionString: testDatabaseUrl, max: 1, options: `-c search_path=${schema},public -c role=${runtime}` });
    const operatorPool = new Pool({ connectionString: testDatabaseUrl, max: 1, options: `-c search_path=${schema},public -c role=${operator}` });
    try {
      const store = new PostgresEnquiryStore(runtimePool); const input = submission();
      const result = await store.accept(input); assert.ok('outboxId' in result);
      const claim = await store.claim({ id: result.outboxId, now: input.now, leaseOwner: 'restricted-worker' }); assert.ok(claim);
      assert.equal(await store.finish({ id: claim.id, leaseOwner: claim.leaseOwner, now: input.now,
        outcome: { kind: 'accepted', providerId: 'restricted-provider' } }), true);
      assert.equal(await store.recordWebhook({ id: 'restricted-event', providerId: 'restricted-provider', type: 'delivered', occurredAt: input.now }), 'recorded');
      assert.equal((await store.takeRateLimit({ key: 'b'.repeat(64), limit: 1, windowMs: 60_000, now: input.now })).allowed, true);
      assert.equal((await operatorPool.query('SELECT count(*) FROM enquiry_operator_inbox')).rows[0].count, '1');
      await assert.rejects(operatorPool.query('SELECT * FROM enquiry_receipts'), /permission denied/);
      await assert.rejects(operatorPool.query('DELETE FROM enquiries'), /permission denied/);
      await assert.rejects(runtimePool.query('SELECT purge_enquiry_pii($1)', [result.receipt]), /permission denied/);
      await assert.rejects(runtimePool.query('UPDATE notification_outbox SET payload = NULL WHERE id = $1', [result.outboxId]), /permission denied/);
    } finally {
      await runtimePool.end(); await operatorPool.end();
      await fixture.pool.query(`DROP OWNED BY ${runtime}; DROP OWNED BY ${operator}; DROP ROLE ${runtime}; DROP ROLE ${operator};`);
    }
  });
});

test('transaction helper releases a broken client after rollback failure', async () => {
  let released: boolean | undefined;
  const store = new PostgresEnquiryStore({ connect: async () => ({
    async query(sql: string) { if (sql === 'BEGIN') return { rows: [], rowCount: null }; throw new Error(sql === 'ROLLBACK' ? 'rollback unavailable' : 'synthetic connection fault'); },
    release(broken?: boolean) { released = broken; },
  }) });
  await assert.rejects(store.accept(submission()), /synthetic connection fault/);
  assert.equal(released, true);
});
