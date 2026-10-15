import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatchOne, repairNotifications } from '../../server/notification-worker.ts';
import { ResendSender, type ResendClient } from '../../server/resend-sender.ts';
import { normalizeEmailAddress } from '../../server/validation.ts';
import { RETRY_WINDOW_MS, type ClaimedNotification, type EnquiryStore, type NotificationOutcome, type NotificationSender } from '../../server/contracts.ts';

const NOW = Date.UTC(2026, 9, 15, 8);
const PROVIDER_ID = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794';
const payload = { from: 'website@example.com', to: 'operator@example.com', subject: 'New website enquiry', text: 'Synthetic test enquiry', replyTo: 'visitor@example.net' };
const item = (overrides: Partial<ClaimedNotification> = {}): ClaimedNotification => ({ id: 'outbox-1', leaseOwner: 'lease-original', payload: { ...payload }, providerKey: 'enquiry-notification/outbox-1', firstAttemptAt: NOW, attemptCount: 1, ...overrides });
const accepted: NotificationSender = { send: async () => ({ kind: 'accepted', providerId: PROVIDER_ID }) };

function fakeStore(items: ClaimedNotification[] = [item()]) {
  const pending = [...items];
  const claims: Parameters<EnquiryStore['claim']>[0][] = [];
  const finished: Parameters<EnquiryStore['finish']>[0][] = [];
  let failFinish = false;
  const store: EnquiryStore = {
    accept: async () => { throw new Error('Not used by worker tests'); },
    claim: async input => {
      claims.push(input);
      const next = pending.shift();
      return next ? { ...next, leaseOwner: input.leaseOwner } : null;
    },
    finish: async input => { if (failFinish) throw new Error('Sensitive store detail must not escape'); finished.push(input); return true; },
    recordWebhook: async () => 'unknown',
    takeRateLimit: async () => ({ allowed: true, retryAfterMs: 0 }),
  };
  return { store, claims, finished, failFinish: () => { failFinish = true; } };
}

test('dispatch claims before sending, preserves immutable payload/key and saves acceptance under the lease', async () => {
  const fake = fakeStore();
  const sender: NotificationSender = { send: async (claimed, signal) => {
    assert.equal(fake.claims.length, 1);
    assert.equal(fake.finished.length, 0);
    assert.equal(signal.aborted, false);
    assert.equal(claimed.providerKey, item().providerKey);
    assert.deepEqual(claimed.payload, payload);
    assert.equal(Object.isFrozen(claimed.payload), true);
    return { kind: 'accepted', providerId: PROVIDER_ID };
  } };
  assert.equal(await dispatchOne({ store: fake.store, sender, now: () => NOW, outboxId: 'outbox-1' }), 'processed');
  assert.equal(fake.claims[0].id, 'outbox-1');
  assert.match(fake.claims[0].leaseOwner, /^[0-9a-f-]{36}$/);
  assert.equal(fake.finished[0].leaseOwner, fake.claims[0].leaseOwner);
  assert.deepEqual(fake.finished[0].outcome, { kind: 'accepted', providerId: PROVIDER_ID });
});

test('empty outbox is idle and never calls the sender', async () => {
  const fake = fakeStore([]);
  let calls = 0;
  const result = await dispatchOne({ store: fake.store, sender: { send: async () => { calls++; return { kind: 'accepted', providerId: PROVIDER_ID }; } } });
  assert.equal(result, 'idle');
  assert.equal(calls, 0);
  assert.equal(fake.finished.length, 0);
});

test('22-hour boundary, future attempt time, exhausted attempts and changed key never send', async () => {
  for (const overrides of [
    { firstAttemptAt: NOW - RETRY_WINDOW_MS },
    { firstAttemptAt: NOW + 1 },
    { attemptCount: 7 },
    { attemptCount: 0 },
    { providerKey: 'fresh-key-to-bypass-retry' },
  ]) {
    const fake = fakeStore([item(overrides)]);
    let calls = 0;
    await dispatchOne({ store: fake.store, sender: { send: async () => { calls++; return { kind: 'accepted', providerId: PROVIDER_ID }; } }, now: () => NOW });
    assert.equal(calls, 0);
    assert.equal(fake.finished[0].outcome.kind, 'reconcile');
  }
});

test('provider timeout returns despite an ignored abort; a late success never overwrites retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fake = fakeStore();
  let signal: AbortSignal | undefined;
  let resolveSend!: (value: NotificationOutcome) => void;
  let started!: () => void;
  const ready = new Promise<void>(resolve => { started = resolve; });
  const sender: NotificationSender = { send: (_, suppliedSignal) => {
    signal = suppliedSignal;
    started();
    return new Promise(resolve => { resolveSend = resolve; });
  } };
  const result = dispatchOne({ store: fake.store, sender, now: () => NOW });
  await ready;
  t.mock.timers.tick(3_999);
  assert.equal(signal!.aborted, false);
  t.mock.timers.tick(1);
  assert.equal(await result, 'processed');
  assert.equal(signal!.aborted, true);
  assert.deepEqual(fake.finished[0].outcome, { kind: 'retry', reason: 'provider_timeout' });
  resolveSend({ kind: 'accepted', providerId: PROVIDER_ID });
  await Promise.resolve();
  assert.equal(fake.finished.length, 1);
  assert.equal(fake.finished[0].outcome.kind, 'retry');
});

test('synchronous provider rejection becomes safe retry without leaking its message', async () => {
  const fake = fakeStore();
  await dispatchOne({ store: fake.store, sender: { send: () => { throw new Error('visitor@example.net sensitive'); } }, now: () => NOW });
  assert.deepEqual(fake.finished[0].outcome, { kind: 'retry', reason: 'provider_transport_error' });
});

test('malformed sender output is bounded retry, and a sixth retry or late Retry-After is reconciliation', async () => {
  for (const [attemptCount, outcome, expected] of [
    [1, { kind: 'accepted', providerId: 'invalid' }, 'retry'],
    [1, { kind: 'retry', reason: 'visitor@example.net' }, 'retry'],
    [6, { kind: 'retry', reason: 'provider_timeout' }, 'reconcile'],
    [1, { kind: 'retry', reason: 'provider_temporary_error', retryAfterMs: RETRY_WINDOW_MS }, 'reconcile'],
  ] as const) {
    const fake = fakeStore([item({ attemptCount })]);
    await dispatchOne({ store: fake.store, sender: { send: async () => outcome }, now: () => NOW });
    assert.equal(fake.finished[0].outcome.kind, expected);
    assert.equal(JSON.stringify(fake.finished).includes('visitor@example.net'), false);
  }
});

test('finish-write failure leaves lease recovery and emits only a fixed diagnostic', async () => {
  const fake = fakeStore();
  fake.failFinish();
  const diagnostics: string[] = [];
  assert.equal(await dispatchOne({ store: fake.store, sender: accepted, now: () => NOW, onDiagnostic: code => diagnostics.push(code) }), 'processed');
  assert.deepEqual(diagnostics, ['notification_state_write_failed']);
  assert.equal(fake.finished.length, 0);
  assert.equal(fake.claims.length, 1);
});

test('diagnostic exceptions cannot invalidate handled work; claim failures propagate safely to caller', async () => {
  const fake = fakeStore();
  fake.failFinish();
  assert.equal(await dispatchOne({ store: fake.store, sender: accepted, now: () => NOW, onDiagnostic: () => { throw new Error('logger failed'); } }), 'processed');
  fake.store.claim = async () => { throw new Error('claim unavailable'); };
  await assert.rejects(dispatchOne({ store: fake.store, sender: accepted }), /claim unavailable/);
});

test('repair handles at most four claims and reports idle without claiming again after a work deadline', async () => {
  const full = fakeStore(Array.from({ length: 8 }, () => item()));
  assert.deepEqual(await repairNotifications({ store: full.store, sender: accepted, now: () => NOW }), { processed: 4, stopReason: 'limit' });
  assert.equal(full.claims.length, 4);
  const empty = fakeStore([]);
  assert.deepEqual(await repairNotifications({ store: empty.store, sender: accepted, now: () => NOW }), { processed: 0, stopReason: 'idle' });
  const expired = fakeStore();
  assert.deepEqual(await repairNotifications({ store: expired.store, sender: accepted, now: () => NOW, workBudgetMs: 0 }), { processed: 0, stopReason: 'deadline' });
  assert.equal(expired.claims.length, 0);
});

test('a delayed claim cannot start a provider call past the 20-second work budget', async () => {
  const fake = fakeStore();
  let clock = NOW;
  let sends = 0;
  const claim = fake.store.claim;
  fake.store.claim = async input => { const value = await claim(input); clock += 20_000; return value; };
  const result = await repairNotifications({ store: fake.store, sender: { send: async () => { sends++; return { kind: 'accepted', providerId: PROVIDER_ID }; } }, now: () => clock, workBudgetMs: 30_000 });
  assert.deepEqual(result, { processed: 1, stopReason: 'deadline' });
  assert.equal(sends, 0);
  assert.deepEqual(fake.finished[0].outcome, { kind: 'retry', reason: 'notification_work_deadline' });
});

function fakeClient(response: unknown, inspect?: (args: Parameters<ResendClient['emails']['send']>) => void): ResendClient {
  return { emails: { send: async (...args) => { inspect?.(args); return response; } } };
}
const senderWith = (client: ResendClient) => new ResendSender({ apiKey: 'synthetic-test-key', from: payload.from, to: payload.to, client, now: () => NOW });

test('Resend adapter sends only the immutable plain-text operator notification, stable key and supplied signal', async () => {
  const controller = new AbortController();
  let calls = 0;
  const sender = senderWith(fakeClient({ data: { id: PROVIDER_ID }, error: null, headers: {} }, args => {
    calls++;
    assert.deepEqual(args[0], payload);
    assert.equal(args[1].idempotencyKey, item().providerKey);
    assert.equal(args[1].signal, controller.signal);
    assert.equal(Object.hasOwn(args[0], 'html'), false);
  }));
  assert.deepEqual(await sender.send(item(), controller.signal), { kind: 'accepted', providerId: PROVIDER_ID });
  assert.equal(calls, 1);
});

test('provider temporary errors retry while invalid keys, payload/auth and idempotency conflicts stop automatic work', async () => {
  for (const [name, statusCode, expected] of [
    ['rate_limit_exceeded', 429, 'retry'], ['application_error', 503, 'retry'],
    ['application_error', null, 'retry'], ['concurrent_idempotent_requests', 409, 'retry'],
    ['invalid_idempotency_key', 400, 'failed'], ['validation_error', 422, 'failed'],
    ['invalid_api_key', 401, 'failed'], ['invalid_from_address', 403, 'failed'],
    ['monthly_quota_exceeded', 403, 'failed'], ['invalid_idempotent_request', 409, 'reconcile'],
  ] as const) {
    const sender = senderWith(fakeClient({ data: null, error: { name, statusCode, message: 'Sensitive provider text' }, headers: { 'retry-after': '120' } }));
    const outcome = await sender.send(item(), new AbortController().signal);
    assert.equal(outcome.kind, expected, name);
    assert.equal(JSON.stringify(outcome).includes('Sensitive'), false);
    if (expected === 'retry') assert.equal((outcome as { retryAfterMs?: number }).retryAfterMs, 120_000);
  }
});

test('Retry-After dates are interpreted, and malformed responses do not claim acceptance', async () => {
  const sender = senderWith(fakeClient({ data: null, error: { name: 'rate_limit_exceeded', statusCode: 429 }, headers: { 'Retry-After': new Date(NOW + 60_000).toUTCString() } }));
  assert.deepEqual(await sender.send(item(), new AbortController().signal), { kind: 'retry', reason: 'provider_temporary_error', retryAfterMs: 60_000 });
  for (const response of [null, {}, { data: { id: PROVIDER_ID } }, { data: { id: 'not-an-id' }, error: null }, { data: { id: PROVIDER_ID }, error: { name: 'application_error' } }]) {
    assert.equal((await senderWith(fakeClient(response)).send(item(), new AbortController().signal)).kind, 'retry');
  }
});

test('routing drift, unsafe payload and an already-aborted call cannot contact the provider', async () => {
  let calls = 0;
  const sender = senderWith(fakeClient(null, () => { calls++; }));
  assert.equal((await sender.send(item({ payload: { ...payload, to: 'different@example.com' } }), new AbortController().signal)).kind, 'reconcile');
  assert.equal((await sender.send(item({ payload: { ...payload, subject: 'Enquiry\r\nBcc: elsewhere' } }), new AbortController().signal)).kind, 'failed');
  const controller = new AbortController(); controller.abort();
  assert.equal((await sender.send(item(), controller.signal)).kind, 'retry');
  assert.equal(calls, 0);
});

test('SDK transport rejection is reduced to a fixed code', async () => {
  const sender = senderWith({ emails: { send: async () => { throw new Error('Authorization or private provider text'); } } });
  assert.deepEqual(await sender.send(item(), new AbortController().signal), { kind: 'retry', reason: 'provider_transport_error' });
});

test('shared IDN validation accepts the normalized reply address without changing the stored payload', async () => {
  const replyTo = normalizeEmailAddress('visitor@उदाहरण.भारत');
  assert.ok(replyTo);
  assert.match(replyTo, /@xn--.+\.xn--/);
  const sender = senderWith(fakeClient({ data: { id: PROVIDER_ID }, error: null }, ([submitted]) => {
    assert.equal(submitted.replyTo, replyTo);
    assert.equal(submitted.to, payload.to);
  }));
  assert.deepEqual(await sender.send(item({ payload: { ...payload, replyTo } }), new AbortController().signal), { kind: 'accepted', providerId: PROVIDER_ID });
});

test('the provider adapter independently refuses an expired notification window', async () => {
  let calls = 0;
  const sender = senderWith(fakeClient(null, () => { calls++; }));
  assert.deepEqual(await sender.send(item({ firstAttemptAt: NOW - RETRY_WINDOW_MS }), new AbortController().signal), { kind: 'reconcile', reason: 'notification_retry_window_exhausted' });
  assert.equal(calls, 0);
});
