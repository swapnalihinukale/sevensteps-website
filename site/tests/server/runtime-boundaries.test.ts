import assert from 'node:assert/strict';
import test from 'node:test';
import type { TestContext } from 'node:test';
import { Socket } from 'node:net';
import { Pool } from 'pg';
import type { Context } from '@netlify/functions';
import enquiries, { config as enquiryConfig } from '../../netlify/functions/enquiries.ts';
import events, { config as eventConfig } from '../../netlify/functions/enquiry-events.ts';
import repair, { config as repairConfig } from '../../netlify/functions/repair-enquiries.ts';

async function disabledBoundary(t: TestContext, run: (calls: Record<string, number>) => Promise<void>) {
  const keys = ['ENQUIRY_MODE', 'ENQUIRY_ACTIVATION', 'CONTEXT', 'NODE_ENV', 'NETLIFY_DB_URL', 'RESEND_API_KEY'];
  const prior = new Map(keys.map(key => [key, process.env[key]]));
  const calls = { tcp: 0, database: 0, http: 0, body: 0, context: 0 };
  // Invalid provider values must remain unread while activation is absent.
  delete process.env.ENQUIRY_MODE; delete process.env.ENQUIRY_ACTIVATION;
  Object.assign(process.env, { CONTEXT: 'production', NODE_ENV: 'production',
    NETLIFY_DB_URL: 'invalid-disabled-database', RESEND_API_KEY: 'synthetic-disabled-key' });
  t.mock.method(Socket.prototype, 'connect', () => { calls.tcp++; throw new Error('Unexpected network connection'); });
  t.mock.method(Pool.prototype, 'connect', () => { calls.database++; throw new Error('Unexpected database connection'); });
  t.mock.method(globalThis, 'fetch', async () => { calls.http++; throw new Error('Unexpected HTTP request'); });
  try {
    await run(calls);
    assert.deepEqual(calls, { tcp: 0, database: 0, http: 0, body: 0, context: 0 });
  } finally {
    for (const key of keys) {
      const value = prior.get(key);
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

function unreadRequest(path: string, method: 'GET' | 'POST', calls: Record<string, number>) {
  const request = new Request(`https://portfolio.example${path}`, {
    method, ...(method === 'POST' ? { body: '{"synthetic":"must remain unread"}' } : {}),
  });
  Object.defineProperty(request, 'body', { get() { calls.body++; throw new Error('Disabled request body was read'); } });
  return request;
}
function unreadContext(calls: Record<string, number>): Context {
  return { get ip() { calls.context++; throw new Error('Disabled context was read'); } } as unknown as Context;
}
async function assertUnavailable(response: Response) {
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('retry-after'), '60');
  assert.deepEqual(await response.json(), { code: 'unavailable', message: 'Enquiries are unavailable. Please try again later.' });
}

test('Netlify token endpoint defaults to 503 without a database, HTTP request or context access', async t => {
  await disabledBoundary(t, async calls => {
    await assertUnavailable(await enquiries(unreadRequest('/api/enquiry-token', 'GET', calls), unreadContext(calls)));
  });
});

test('Netlify enquiry endpoint defaults to 503 without reading the body or constructing a received state', async t => {
  await disabledBoundary(t, async calls => {
    await assertUnavailable(await enquiries(unreadRequest('/api/enquiries', 'POST', calls), unreadContext(calls)));
    // A failed activation must not leave a cached runtime for the next request.
    await assertUnavailable(await enquiries(unreadRequest('/api/enquiries', 'POST', calls), unreadContext(calls)));
  });
});

test('Netlify webhook defaults to 503 before reading or recording an event', async t => {
  await disabledBoundary(t, async calls => {
    await assertUnavailable(await events(unreadRequest('/api/enquiry-events', 'POST', calls)));
  });
});

test('disabled scheduled repair returns 503 without connecting, claiming or sending', async t => {
  await disabledBoundary(t, async () => { await assertUnavailable(await repair()); });
});

test('deployed function metadata retains explicit API paths and four-hour repair schedule', () => {
  assert.deepEqual(enquiryConfig.path, ['/api/enquiry-token', '/api/enquiries']);
  assert.equal(eventConfig.path, '/api/enquiry-events');
  assert.equal(repairConfig.schedule, '0 */4 * * *');
});
