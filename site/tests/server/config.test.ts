import test from 'node:test';
import assert from 'node:assert/strict';
import { readLiveConfig } from '../../server/config.ts';
import { createLiveRuntime } from '../../server/live-runtime.ts';
import { connectEnquiryForm } from '../../src/scripts/enquiry-client.ts';

function fixture(): NodeJS.ProcessEnv {
  return {
    ENQUIRY_MODE: 'live', ENQUIRY_ACTIVATION: 'approved', CONTEXT: 'production', NODE_ENV: 'production',
    SITE_ORIGIN: 'https://portfolio.example', ENQUIRY_FROM: 'sender@example.test', ENQUIRY_TO: 'operator@example.test',
    NETLIFY_DB_URL: 'postgresql://runtime@database.example/sevensteps?sslmode=verify-full',
    ENQUIRY_TOKEN_KEY_ID: 'test', ENQUIRY_TOKEN_KEYS: JSON.stringify({ test: 'a'.repeat(32) }),
    ENQUIRY_FINGERPRINT_KEY: 'b'.repeat(32), ENQUIRY_RATE_KEY: 'c'.repeat(32),
    RESEND_API_KEY: 'synthetic-test-only', RESEND_WEBHOOK_SECRET: 'synthetic-test-only',
  };
}
test('all live activation gates must agree before constructing providers', () => {
  for (const key of ['ENQUIRY_MODE', 'ENQUIRY_ACTIVATION', 'CONTEXT', 'NODE_ENV']) {
    assert.throws(() => createLiveRuntime({ ...fixture(), [key]: 'disabled' }), /disabled/);
  }
  assert.throws(() => createLiveRuntime({}), /disabled/);
  assert.equal(readLiveConfig(fixture()).origin, 'https://portfolio.example');
  assert.equal(typeof connectEnquiryForm, 'function');
});
test('public origin and database TLS configuration fail closed', () => {
  for (const origin of ['http://portfolio.example', 'https://portfolio.example/path', 'https://portfolio.example/', 'https://localhost']) {
    assert.throws(() => readLiveConfig({ ...fixture(), SITE_ORIGIN: origin }));
  }
  for (const sslmode of ['disable', 'prefer', 'require']) {
    assert.throws(() => readLiveConfig({ ...fixture(), NETLIFY_DB_URL: `postgresql://runtime@database.example/sevensteps?sslmode=${sslmode}` }));
  }
  for (const suffix of ['&sslmode=disable', '&ssl=false', '&uselibpqcompat=true', '&host=unreviewed.example']) {
    assert.throws(() => readLiveConfig({ ...fixture(), NETLIFY_DB_URL: fixture().NETLIFY_DB_URL + suffix }));
  }
  assert.throws(() => readLiveConfig({ ...fixture(), NETLIFY_DB_DRIVER: 'serverless' }));
  assert.throws(() => readLiveConfig({ ...fixture(), ENQUIRY_TO: 'a@example.test\r\nBcc:b@example.test' }));
});
test('missing secrets and shared rate/fingerprint keys fail before activation', () => {
  for (const key of Object.keys(fixture())) assert.throws(() => readLiveConfig({ ...fixture(), [key]: '' }));
  assert.throws(() => readLiveConfig({ ...fixture(), ENQUIRY_RATE_KEY: 'short' }));
  assert.throws(() => readLiveConfig({ ...fixture(), ENQUIRY_RATE_KEY: fixture().ENQUIRY_FINGERPRINT_KEY }));
});
