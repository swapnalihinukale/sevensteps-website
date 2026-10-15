import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyNotificationWebhook } from '../../server/webhook.ts';

const KEY = Buffer.alloc(32, 19);
const SECRET = `whsec_${KEY.toString('base64')}`;
const NOW = Date.UTC(2026, 9, 15, 8);
const ID = 'msg_synthetic_notification_01';
const PROVIDER_ID = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794';
function sign(body: string, seconds = Math.floor(NOW / 1000), id = ID) {
  const signature = createHmac('sha256', KEY).update(`${id}.${seconds}.${body}`).digest('base64');
  return { 'svix-id': id, 'svix-timestamp': String(seconds), 'svix-signature': `v1,${signature}` };
}
function body(type = 'email.delivered', extra: Record<string, unknown> = {}) {
  return JSON.stringify({ type, created_at: new Date(NOW - 1000).toISOString(), data: { email_id: PROVIDER_ID }, ...extra });
}

test('signed delivery lifecycle events become minimal records with header event IDs and no personal content', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  for (const [type, expected] of [['email.sent', 'sent'], ['email.delivered', 'delivered'], ['email.bounced', 'bounced'], ['email.failed', 'failed'], ['email.complained', 'complained'], ['email.delivery_delayed', 'delivery_delayed'], ['email.suppressed', 'failed']] as const) {
    const raw = body(type, { data: { email_id: PROVIDER_ID, to: ['private@example.net'], subject: 'Private content' } });
    assert.deepEqual(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), { id: ID, providerId: PROVIDER_ID, type: expected, occurredAt: NOW - 1000 });
  }
});

test('repeated verified event has the same ID for store deduplication; older occurrence remains available for ordering', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  const raw = body('email.sent', { created_at: new Date(NOW - 86_400_000).toISOString() });
  const first = verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW);
  assert.deepEqual(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), first);
  assert.deepEqual(first, { id: ID, providerId: PROVIDER_ID, type: 'sent', occurredAt: NOW - 86_400_000 });
});

test('tampered body, wrong secret, wrong signature and missing headers are rejected', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  const raw = body();
  assert.equal(verifyNotificationWebhook(`${raw} `, sign(raw), SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, sign(raw), `whsec_${Buffer.alloc(32, 20).toString('base64')}`, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, { ...sign(raw), 'svix-signature': 'v1,invalid' }, SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, {}, SECRET, () => NOW), null);
});

test('replay timestamps outside five minutes in either direction fail; exact boundary is allowed', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  const raw = body();
  for (const difference of [-301, 301]) assert.equal(verifyNotificationWebhook(raw, sign(raw, NOW / 1000 + difference), SECRET, () => NOW), null);
  for (const difference of [-300, 300]) assert.notEqual(verifyNotificationWebhook(raw, sign(raw, NOW / 1000 + difference), SECRET, () => NOW), null);
});

test('tracking and unsupported signed types are ignored only after signature verification', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  for (const type of ['email.opened', 'email.clicked', 'contact.created', 'email.future_event']) {
    const raw = body(type);
    assert.deepEqual(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), { kind: 'ignored' });
    assert.equal(verifyNotificationWebhook(raw, {}, SECRET, () => NOW), null);
  }
});

test('known events need strict provider IDs and valid RFC3339 occurrence time', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  for (const extra of [
    { data: { email_id: 'not-a-provider-id' } }, { data: null },
    { created_at: 'yesterday' }, { created_at: '2026-02-30T08:00:00Z' },
    { created_at: '2026-10-15T24:00:00Z' }, { created_at: new Date(NOW + 301_000).toISOString() },
  ]) {
    const raw = body('email.delivered', extra);
    assert.equal(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), null);
  }
  const raw = body('email.delivered', { created_at: '2026-10-15T13:29:59+05:30' });
  assert.deepEqual(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), { id: ID, providerId: PROVIDER_ID, type: 'delivered', occurredAt: NOW - 1000 });
});

test('header casing is accepted, ambiguous aliases/duplicates and malformed header IDs/timestamps are rejected', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  const raw = body();
  const headers = sign(raw);
  assert.notEqual(verifyNotificationWebhook(raw, new Headers(headers), SECRET, () => NOW), null);
  assert.notEqual(verifyNotificationWebhook(raw, Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toUpperCase(), value])), SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, { ...headers, 'webhook-id': 'msg_conflicting_identity' }, SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, { ...headers, 'Svix-Id': ID }, SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, { ...headers, 'svix-timestamp': `${NOW / 1000}junk` }, SECRET, () => NOW), null);
  assert.equal(verifyNotificationWebhook(raw, sign(raw, NOW / 1000, 'visitor@example.net'), SECRET, () => NOW), null);
});

test('oversized raw bodies, malformed JSON/envelopes and invalid secrets are rejected without throwing', t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  for (const raw of ['{', '[]', 'null', '{}', JSON.stringify({ type: 42 }), ' '.repeat(65_537)]) {
    assert.equal(verifyNotificationWebhook(raw, sign(raw), SECRET, () => NOW), null);
  }
  const raw = body();
  assert.equal(verifyNotificationWebhook(raw, sign(raw), 'whsec_bad', () => NOW), null);
});
