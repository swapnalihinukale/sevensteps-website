import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createEnquiryApi, type ApiDependencies } from '../../server/http.ts';
import { createTokenService } from '../../server/tokens.ts';
import { TOKEN_TTL_MS, type AcceptInput, type Enquiry, type EnquiryStore, type NotificationSender } from '../../server/contracts.ts';
import { postgresFixture, testDatabaseUrl } from './postgres-fixture.ts';

const origin = 'https://portfolio.example.test';
const initialTime = 1_800_000_000_000;
const visitor = { ip: '192.0.2.42' };
const enquiry: Enquiry = {
  name: 'Synthetic Visitor', email: 'visitor@example.test', when: 'October', where: 'Test place',
  message: 'Synthetic private question', story: 'wedding-story',
};

function harness() {
  const clock = { value: initialTime };
  const calls = {
    accept: [] as AcceptInput[],
    claim: [] as Parameters<EnquiryStore['claim']>[0][],
    finish: [] as Parameters<EnquiryStore['finish']>[0][],
    rate: [] as Parameters<EnquiryStore['takeRateLimit']>[0][],
    send: [] as Parameters<NotificationSender['send']>[0][],
    diagnostics: [] as string[],
  };
  const records = new Map<string, { input: AcceptInput; receipt: string; outboxId: string; claimed: boolean }>();
  const store: EnquiryStore = {
    async accept(input) {
      calls.accept.push(structuredClone(input));
      const key = `${input.formVersion}:${input.tokenId}`;
      const prior = records.get(key);
      if (prior) return prior.input.fingerprint === input.fingerprint
        ? { kind: 'duplicate', receipt: prior.receipt, outboxId: prior.outboxId }
        : { kind: 'conflict' };
      const record = { input: structuredClone(input), receipt: `receipt-${records.size + 1}`, outboxId: `outbox-${records.size + 1}`, claimed: false };
      records.set(key, record);
      return { kind: 'received', receipt: record.receipt, outboxId: record.outboxId };
    },
    async claim(input) {
      calls.claim.push(input);
      const record = [...records.values()].find((row) => !row.claimed && (!input.id || row.outboxId === input.id));
      if (!record) return null;
      record.claimed = true;
      return {
        id: record.outboxId, leaseOwner: input.leaseOwner, payload: record.input.notification,
        providerKey: `enquiry-notification/${record.outboxId}`, firstAttemptAt: input.now, attemptCount: 1,
      };
    },
    async finish(input) { calls.finish.push(input); return true; },
    async recordWebhook() { return 'unknown'; },
    async takeRateLimit(input) { calls.rate.push(input); return { allowed: true, retryAfterMs: 0 }; },
  };
  const sender: NotificationSender = {
    async send(item) {
      calls.send.push(item);
      return { kind: 'accepted', providerId: '11111111-1111-4111-8111-111111111111' };
    },
  };
  const tokens = createTokenService({
    activeKeyId: 'test', keys: { test: 't'.repeat(32) }, fingerprintKey: 'f'.repeat(32),
  });
  const dependencies: ApiDependencies = {
    store, sender, tokens, origin, from: 'sender@example.test', to: 'operator@example.test',
    rateKey: 'r'.repeat(32), now: () => clock.value, diagnostic: (code) => { calls.diagnostics.push(code); },
  };
  return { api: createEnquiryApi(dependencies), dependencies, store, sender, tokens, calls, records, clock };
}

function post(token: string, value: unknown = enquiry, options: { headers?: Record<string, string>; path?: string; raw?: BodyInit } = {}) {
  return new Request(`${origin}${options.path ?? '/api/enquiries'}`, {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...options.headers },
    body: options.raw ?? JSON.stringify({ token, enquiry: value }),
  });
}

async function responseData(response: Response): Promise<Record<string, unknown>> {
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  const text = await response.text();
  for (const privateValue of [enquiry.name, enquiry.email, enquiry.message, enquiry.where, visitor.ip]) {
    assert.ok(!text.includes(privateValue), `Response echoed synthetic private input: ${privateValue}`);
  }
  return JSON.parse(text);
}

test('issues a no-store token without returning personal data', async () => {
  const h = harness();
  const response = await h.api(new Request(`${origin}/api/enquiry-token`), visitor);
  assert.equal(response.status, 200);
  const body = await responseData(response);
  assert.equal(body.expiresAt, initialTime + TOKEN_TTL_MS);
  assert.ok(h.tokens.verify(body.token, initialTime));
  assert.equal(h.calls.accept.length, 0);
  assert.deepEqual(h.calls.rate.map((entry) => entry.limit), [600, 60]);
});

test('does not send or return receipt before the store commits', async () => {
  const h = harness();
  const originalAccept = h.store.accept;
  let allowCommit!: () => void;
  let entered!: () => void;
  const pendingCommit = new Promise<void>((resolve) => { allowCommit = resolve; });
  const accepting = new Promise<void>((resolve) => { entered = resolve; });
  h.store.accept = async (input) => { entered(); await pendingCommit; return originalAccept(input); };
  let settled = false;
  const pending = h.api(post(h.tokens.issue(initialTime).token), visitor).then((response) => { settled = true; return response; });
  await accepting;
  assert.equal(settled, false);
  assert.equal(h.records.size, 0);
  assert.equal(h.calls.send.length, 0);
  assert.equal(h.calls.claim.length, 0);
  allowCommit();
  const response = await pending;
  assert.equal(response.status, 201);
  const body = await responseData(response);
  assert.equal(body.code, 'received');
  assert.equal(body.receipt, [...h.records.values()][0].receipt);
  assert.equal(h.calls.send.length, 1);
  assert.equal(h.calls.finish[0].outcome.kind, 'accepted');
  assert.deepEqual(h.calls.rate.map((entry) => entry.limit), [200, 30]);
  assert.equal(h.calls.accept[0].fingerprint, h.tokens.fingerprint(enquiry));
});

test('a pre-commit storage failure returns a safe 503 without sending', async () => {
  const h = harness();
  h.store.accept = async () => { throw new Error(`${enquiry.email}: synthetic storage failure`); };
  const response = await h.api(post(h.tokens.issue(initialTime).token), visitor);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('retry-after'), '60');
  assert.equal((await responseData(response)).code, 'unavailable');
  assert.equal(h.records.size, 0);
  assert.equal(h.calls.send.length, 0);
  assert.deepEqual(h.calls.diagnostics, ['enquiry_storage_unavailable']);
});

test('post-commit provider failure preserves the receipt and records repair work', async () => {
  const h = harness();
  h.sender.send = async (item) => { h.calls.send.push(item); throw new Error(`${enquiry.email}: synthetic transport failure`); };
  const response = await h.api(post(h.tokens.issue(initialTime).token), visitor);
  assert.equal(response.status, 201);
  assert.equal((await responseData(response)).code, 'received');
  assert.equal(h.records.size, 1);
  assert.equal(h.calls.send.length, 1);
  assert.deepEqual(h.calls.finish[0].outcome, { kind: 'retry', reason: 'provider_transport_error' });
});

test('a post-commit claim failure does not turn a received enquiry into a failure', async () => {
  const h = harness();
  h.store.claim = async () => { throw new Error('Synthetic outbox outage'); };
  const response = await h.api(post(h.tokens.issue(initialTime).token), visitor);
  assert.equal(response.status, 201);
  assert.equal((await responseData(response)).code, 'received');
  assert.equal(h.records.size, 1);
  assert.equal(h.calls.send.length, 0);
  assert.deepEqual(h.calls.diagnostics, ['notification_dispatch_unavailable']);
});

test('diagnostic failures cannot undo a committed receipt or escape the HTTP handler', async () => {
  const h = harness();
  h.store.claim = async () => { throw new Error('Synthetic outbox outage'); };
  h.dependencies.diagnostic = () => { throw new Error('Synthetic logging outage'); };
  const response = await h.api(post(h.tokens.issue(initialTime).token), visitor);
  assert.equal(response.status, 201);
  assert.equal((await responseData(response)).code, 'received');
  assert.equal(h.records.size, 1);
});

test('same-key retry returns the same receipt and changed content returns conflict', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const first = await h.api(post(token), visitor);
  const firstBody = await responseData(first);
  assert.equal(first.status, 201);
  const duplicate = await h.api(post(token, { ...enquiry, email: 'visitor@EXAMPLE.TEST' }), visitor);
  assert.equal(duplicate.status, 200);
  assert.deepEqual(await responseData(duplicate), firstBody);
  const changed = await h.api(post(token, { ...enquiry, message: 'Different synthetic question' }), visitor);
  assert.equal(changed.status, 409);
  assert.equal((await responseData(changed)).code, 'conflict');
  assert.equal(h.records.size, 1);
  assert.equal(h.calls.send.length, 1);
  assert.equal(h.calls.claim.length, 1);
});

test('a new portfolio slug keeps one receipt and notification through a recreated handler and retry', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const value = { ...enquiry, story: 'family-at-home' };
  const first = await h.api(post(token, value), visitor);
  assert.equal(first.status, 201);
  const receipt = await responseData(first);
  // A later handler has no dependency on a current portfolio catalogue.
  const nextHandler = createEnquiryApi(h.dependencies);
  const repeated = await nextHandler(post(token, { ...value, story: ' family-at-home ' }), visitor);
  assert.equal(repeated.status, 200);
  assert.deepEqual(await responseData(repeated), receipt);
  const changed = await nextHandler(post(token, { ...value, story: 'portraits-in-pune' }), visitor);
  assert.equal(changed.status, 409);
  assert.equal((await responseData(changed)).code, 'conflict');
  assert.equal(h.records.size, 1);
  assert.equal(h.calls.send.length, 1);
  assert.equal(h.calls.claim.length, 1);
  assert.equal(h.calls.accept[0].enquiry.story, value.story);
  assert.ok(h.calls.send[0].payload.text.includes('Story: family-at-home'));
});

test('malformed JSON and extra envelope fields never reach storage', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  for (const raw of ['{broken', 'null', '[]', '42', JSON.stringify({ token, enquiry, recipient: 'other@example.test' })]) {
    const response = await h.api(post(token, enquiry, { raw }), visitor);
    assert.equal(response.status, 400);
    assert.equal((await responseData(response)).code, 'invalid_request');
  }
  const invalidUtf8 = await h.api(post(token, enquiry, { raw: new Uint8Array([0xff]) }), visitor);
  assert.equal(invalidUtf8.status, 400);
  await responseData(invalidUtf8);
  assert.equal(h.calls.accept.length, 0);
});

test('wrong content type or encoded bodies are rejected before parsing', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const unsupportedHeaders: Record<string, string>[] = [
    { 'content-type': 'text/plain' }, { 'content-type': 'application/x-www-form-urlencoded' },
    { 'content-type': 'application/json; charset=iso-8859-1' }, { 'content-encoding': 'gzip' },
  ];
  for (const headers of unsupportedHeaders) {
    const response = await h.api(post(token, enquiry, { headers }), visitor);
    assert.equal(response.status, 415);
    await responseData(response);
  }
  assert.equal(h.calls.accept.length, 0);
});

test('enforces both declared and actual body byte limits', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const serialized = JSON.stringify({ token, enquiry });
  const multibyte = JSON.stringify({ token, enquiry: { ...enquiry, message: '界'.repeat(22_000) } });
  assert.ok(multibyte.length < 65_536 && Buffer.byteLength(multibyte, 'utf8') > 65_536);
  for (const options of [
    { headers: { 'content-length': '65537' } },
    { raw: serialized.padEnd(65_537), headers: { 'content-length': '1' } },
    { raw: multibyte },
  ]) {
    const response = await h.api(post(token, enquiry, options), visitor);
    assert.equal(response.status, 413);
    await responseData(response);
  }
  assert.equal(h.calls.accept.length, 0);
});

test('accepts a valid JSON body at the exact 64 KiB byte boundary', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const raw = JSON.stringify({ token, enquiry }).padEnd(65_536);
  assert.equal(Buffer.byteLength(raw, 'utf8'), 65_536);
  const response = await h.api(post(token, enquiry, { raw, headers: { 'content-length': '65536' } }), visitor);
  assert.equal(response.status, 201);
  assert.equal((await responseData(response)).code, 'received');
  assert.deepEqual(h.calls.accept[0].enquiry, enquiry);
});

for (const encoding of ['literal UTF-8', 'escaped UTF-16'] as const) {
  test(`accepts maximum-length Unicode fields encoded as ${encoding} within 64 KiB`, async () => {
    const h = harness();
    const token = h.tokens.issue(initialTime).token;
    const value: Enquiry = {
      name: '界'.repeat(100),
      email: `${'e'.repeat(64)}@${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(61)}`,
      when: '時'.repeat(120), where: '地'.repeat(200), message: '🙂'.repeat(4000), story: 'couple-session',
    };
    assert.equal(Buffer.byteLength(value.email, 'utf8'), 254);
    assert.equal([...value.message].length, 4000);
    assert.equal(Buffer.byteLength(value.message, 'utf8'), 16_000);
    let raw = JSON.stringify({ token, enquiry: value });
    if (encoding === 'escaped UTF-16') {
      // Escape every code unit in each JSON string, including keys and the
      // token. Emoji become valid surrogate pairs after the server parses it.
      raw = raw.replace(/"(?:[^"\\]|\\.)*"/g, (literal) => {
        const string: string = JSON.parse(literal);
        return `"${string.split('').map((unit) => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join('')}"`;
      });
      assert.ok(!raw.includes(value.name) && !raw.includes('🙂'));
      assert.deepEqual(JSON.parse(raw), { token, enquiry: value });
    }
    const bytes = Buffer.byteLength(raw, 'utf8');
    assert.ok(bytes > 16_384 && bytes < 65_536);
    const response = await h.api(post(token, value, { raw, headers: { 'content-length': String(bytes) } }), visitor);
    assert.equal(response.status, 201);
    const body = await responseData(response);
    assert.equal(body.code, 'received');
    for (const privateValue of [value.name, value.email, value.when, value.where, value.message]) {
      assert.ok(!JSON.stringify(body).includes(privateValue));
    }
    assert.equal(h.calls.accept.length, 1);
    assert.deepEqual(h.calls.accept[0].enquiry, value);
    assert.equal(h.calls.send.length, 1);
  });
}

test('reports safe field errors for controls, extra fields, bad types and oversized values', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  for (const input of [
    { ...enquiry, email: `${enquiry.email}\r\nBcc: other@example.test` },
    { ...enquiry, name: 'Name\nMore' }, { ...enquiry, where: 42 },
    { ...enquiry, message: 'x'.repeat(4001) }, { ...enquiry, sender: 'other@example.test' },
    { ...enquiry, story: '../unavailable-story' },
  ]) {
    const response = await h.api(post(token, input), visitor);
    assert.equal(response.status, 422);
    assert.equal((await responseData(response)).code, 'validation');
  }
  assert.equal(h.calls.accept.length, 0);
});

test('rejects missing or cross-site submission origins and cross-site token requests', async () => {
  const h = harness();
  const token = h.tokens.issue(initialTime).token;
  const missing = post(token);
  missing.headers.delete('origin');
  const requests = [
    missing, post(token, enquiry, { headers: { origin: 'https://other.example.test' } }),
    post(token, enquiry, { headers: { origin: 'null' } }),
    post(token, enquiry, { headers: { 'sec-fetch-site': 'cross-site' } }),
    new Request('https://other.example.test/api/enquiries', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ token, enquiry }) }),
    new Request(`${origin}/api/enquiry-token`, { headers: { origin: 'https://other.example.test' } }),
    new Request(`${origin}/api/enquiry-token`, { headers: { 'sec-fetch-site': 'cross-site' } }),
  ];
  for (const request of requests) {
    const response = await h.api(request, visitor);
    assert.equal(response.status, 403);
    assert.equal((await responseData(response)).code, 'origin_rejected');
  }
  assert.equal(h.calls.rate.length, 0);
  assert.equal(h.calls.accept.length, 0);
});

test('fails closed for unsupported routes, methods and query strings', async () => {
  const h = harness();
  for (const [path, method, status, allow] of [
    ['/api/enquiries', 'GET', 405, 'POST'], ['/api/enquiry-token', 'POST', 405, 'GET'],
    ['/api/enquiries', 'OPTIONS', 405, 'POST'], ['/api/enquiries/', 'POST', 404, null],
    ['/api/unknown', 'GET', 404, null], ['/api/enquiries?email=hidden', 'POST', 403, null],
    ['/api/enquiry-token?extra=1', 'GET', 403, null],
  ] as const) {
    const response = await h.api(new Request(`${origin}${path}`, { method, headers: { origin } }), visitor);
    assert.equal(response.status, status);
    assert.equal(response.headers.get('allow'), allow);
    await responseData(response);
  }
  assert.equal(h.calls.rate.length, 0);
});

test('uses trusted adapter IP and ignores forwarded request headers', async () => {
  const h = harness();
  const request = () => new Request(`${origin}/api/enquiry-token`, { headers: { 'x-forwarded-for': '203.0.113.99', 'x-real-ip': '203.0.113.100' } });
  for (const context of [{}, { ip: 'not-an-ip' }, { ip: '192.0.2.1, 192.0.2.2' }]) {
    const response = await h.api(request(), context);
    assert.equal(response.status, 503);
    await responseData(response);
  }
  assert.equal(h.calls.rate.length, 0);
  await h.api(request(), visitor);
  const firstKey = h.calls.rate[1].key;
  await h.api(new Request(`${origin}/api/enquiry-token`, { headers: { 'x-forwarded-for': '203.0.113.1' } }), visitor);
  assert.equal(h.calls.rate[3].key, firstKey);
  await h.api(request(), { ip: '::ffff:192.0.2.42' });
  assert.equal(h.calls.rate[5].key, firstKey);
  await h.api(request(), { ip: '192.0.2.43' });
  assert.notEqual(h.calls.rate[7].key, firstKey);
  for (const call of h.calls.rate) {
    assert.match(call.key, /^[a-f0-9]{64}$/);
    assert.ok(!call.key.includes(visitor.ip) && !call.key.includes('203.0.113'));
  }
});

test('rate limits return a bounded Retry-After without accepting or sending', async () => {
  const h = harness();
  h.store.takeRateLimit = async (input) => {
    h.calls.rate.push(input);
    return { allowed: false, retryAfterMs: 1250 };
  };
  const response = await h.api(post(h.tokens.issue(initialTime).token), visitor);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '2');
  assert.equal((await responseData(response)).code, 'rate_limited');
  assert.equal(h.calls.rate.length, 1);
  assert.equal(h.calls.accept.length, 0);
  assert.equal(h.calls.send.length, 0);
});

test('a rate-store failure returns 503 before token issuance or storage', async () => {
  const h = harness();
  h.store.takeRateLimit = async () => { throw new Error('Synthetic rate store unavailable'); };
  const response = await h.api(new Request(`${origin}/api/enquiry-token`), visitor);
  assert.equal(response.status, 503);
  assert.equal((await responseData(response)).code, 'unavailable');
  assert.equal(h.calls.accept.length, 0);
});

test('expired and invalid tokens never create an enquiry', async () => {
  const h = harness();
  const issued = h.tokens.issue(initialTime);
  h.clock.value = issued.claims.expiresAt;
  for (const token of [issued.token, '', 'not-a-token', `${issued.token}.extra`]) {
    const response = await h.api(post(token), visitor);
    assert.equal(response.status, 409);
    assert.equal((await responseData(response)).code, 'token_expired');
  }
  assert.equal(h.calls.accept.length, 0);
  assert.equal(h.calls.send.length, 0);
});

test('real PostgreSQL round trip keeps one retrievable enquiry after a lost-acknowledgement retry', {
  skip: !testDatabaseUrl ? 'Run through the isolated PostgreSQL test runner.' : false,
}, async () => {
  const fixture = await postgresFixture();
  try {
    await fixture.pool.query(await readFile(new URL('../../server/operator-views.sql', import.meta.url), 'utf8'));
    const h = harness();
    h.dependencies.store = fixture.store;
    const tokenResponse = await h.api(new Request(`${origin}/api/enquiry-token`), visitor);
    assert.equal(tokenResponse.status, 200);
    const tokenBody = await responseData(tokenResponse);
    assert.equal(typeof tokenBody.token, 'string');
    const token = tokenBody.token as string;
    const first = await h.api(post(token), visitor);
    assert.equal(first.status, 201);
    // Discard the first acknowledgement as a client could after a connection
    // loss, then retrieve the committed result through the operator view.
    await first.body?.cancel();
    const inbox = await fixture.pool.query('SELECT receipt, name, email, message, notification_status FROM enquiry_operator_inbox');
    assert.equal(inbox.rowCount, 1);
    assert.equal(inbox.rows[0].name, enquiry.name);
    assert.equal(inbox.rows[0].email, enquiry.email);
    assert.equal(inbox.rows[0].message, enquiry.message);
    assert.equal(inbox.rows[0].notification_status, 'accepted');
    const retry = await h.api(post(token), visitor);
    assert.equal(retry.status, 200);
    assert.equal((await responseData(retry)).receipt, inbox.rows[0].receipt);
    const changed = await h.api(post(token, { ...enquiry, message: 'Changed synthetic question' }), visitor);
    assert.equal(changed.status, 409);
    assert.equal((await responseData(changed)).code, 'conflict');
    for (const table of ['enquiry_receipts', 'enquiries', 'notification_outbox']) {
      assert.equal((await fixture.pool.query(`SELECT count(*) FROM ${table}`)).rows[0].count, '1');
    }
    const outbox = await fixture.pool.query('SELECT payload, attempt_count, provider_key, id FROM notification_outbox');
    assert.equal(outbox.rows[0].attempt_count, 1);
    assert.equal(outbox.rows[0].payload.replyTo, enquiry.email);
    assert.equal(outbox.rows[0].provider_key, `enquiry-notification/${outbox.rows[0].id}`);
    assert.equal(h.calls.send.length, 1);
    const buckets = await fixture.pool.query('SELECT key_hash FROM enquiry_rate_limits');
    assert.ok(buckets.rowCount && buckets.rowCount >= 4);
    for (const bucket of buckets.rows) assert.match(bucket.key_hash, /^[a-f0-9]{64}$/);
  } finally { await fixture.close(); }
});
