import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createTokenService } from '../../server/tokens.ts';
import { FORM_VERSION, TOKEN_TTL_MS, type Enquiry } from '../../server/contracts.ts';

// Synthetic keys for isolated tests only. Production secrets must be random.
const oldKey = 'a'.repeat(32);
const newKey = 'b'.repeat(32);
const fingerprintKey = 'f'.repeat(32);
const now = 1_800_000_000_000;
const configuration = { activeKeyId: 'old', keys: { old: oldKey }, fingerprintKey };
const enquiry: Enquiry = {
  name: 'Test Person', email: 'person@example.test', when: '', where: '', message: '', story: '',
};

function signedEnvelope(serialized: string, key = oldKey): string {
  const encoded = Buffer.from(serialized).toString('base64url');
  const mac = createHmac('sha256', key).update('seven-steps:submission-token:v1\n').update(encoded, 'ascii').digest('base64url');
  return `${encoded}.${mac}`;
}

function issuedEnvelope() {
  const issued = createTokenService(configuration).issue(now);
  return JSON.parse(Buffer.from(issued.token.split('.')[0], 'base64url').toString('utf8'));
}

test('issues a signed token with a 128-bit random ID and an exact 24-hour lifetime', () => {
  const service = createTokenService(configuration);
  const first = service.issue(now);
  assert.match(first.claims.id, /^[a-f0-9]{32}$/);
  assert.equal(first.claims.formVersion, FORM_VERSION);
  assert.equal(first.claims.issuedAt, now);
  assert.equal(first.claims.expiresAt, now + TOKEN_TTL_MS);
  assert.deepEqual(service.verify(first.token, now), first.claims);
  assert.deepEqual(Object.keys(service.verify(first.token, now)!).sort(), ['expiresAt', 'formVersion', 'id', 'issuedAt']);
  const ids = new Set(Array.from({ length: 50 }, () => service.issue(now).claims.id));
  assert.equal(ids.size, 50);
  assert.ok(first.token.length < 1024);
});

test('checks secret size, separate fingerprint key and explicit key configuration', () => {
  const invalidConfigurations: Parameters<typeof createTokenService>[0][] = [
    { ...configuration, keys: { old: 'a'.repeat(31) } },
    { ...configuration, fingerprintKey: 'f'.repeat(31) },
    { ...configuration, fingerprintKey: oldKey },
    { ...configuration, activeKeyId: 'missing' },
    { ...configuration, activeKeyId: 'not/a/key' },
    { ...configuration, keys: {} },
    { ...configuration, keys: { old: 'a'.repeat(4097) } },
  ];
  for (const options of invalidConfigurations) assert.throws(() => createTokenService(options));
  assert.doesNotThrow(() => createTokenService({ ...configuration, keys: { old: 'é'.repeat(16) } }));
  assert.throws(() => createTokenService({ ...configuration, activeKeyId: 1 } as never));
});

test('rejects expiry at the boundary and tokens presented before their issue time', () => {
  const service = createTokenService(configuration);
  const { token, claims } = service.issue(now);
  assert.deepEqual(service.verify(token, claims.expiresAt - 1), claims);
  assert.equal(service.verify(token, claims.expiresAt), null);
  assert.equal(service.verify(token, claims.expiresAt + 1), null);
  assert.equal(service.verify(token, now - 1), null);
  for (const invalid of [NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(service.verify(token, invalid), null);
    assert.throws(() => service.issue(invalid));
  }
  assert.throws(() => service.issue(Number.MAX_SAFE_INTEGER));
});

test('rejects tampering, non-canonical encodings, extra segments and oversized tokens', () => {
  const service = createTokenService(configuration);
  const { token } = service.issue(now);
  const [payload, signature] = token.split('.');
  const alteredSignature = `${signature[0] === 'a' ? 'b' : 'a'}${signature.slice(1)}`;
  for (const invalid of [
    '', null, undefined, 42, {}, Buffer.from(token), token + '.extra', payload,
    `${payload}.${alteredSignature}`, `${payload}=.${signature}`, `${payload}.${signature}=`,
    ` ${token}`, `${token}\n`, `${payload}.${signature.slice(1)}`, 'a'.repeat(1025),
  ]) assert.equal(service.verify(invalid, now), null);
  const parsed = issuedEnvelope();
  parsed.id = '0'.repeat(32);
  const changedPayload = Buffer.from(JSON.stringify(parsed)).toString('base64url');
  assert.equal(service.verify(`${changedPayload}.${signature}`, now), null);
});

test('enforces token schema and time constraints even for a valid MAC', () => {
  const service = createTokenService(configuration);
  const original = issuedEnvelope();
  for (const patch of [
    { version: 2 }, { version: '1' }, { keyId: 'unknown' }, { keyId: 'constructor' },
    { id: 'a'.repeat(31) }, { id: 'A'.repeat(32) }, { id: 1 }, { formVersion: 'another-form' },
    { issuedAt: String(now) }, { issuedAt: now + 0.5 }, { expiresAt: now + TOKEN_TTL_MS + 1 },
    { issuedAt: -1, expiresAt: TOKEN_TTL_MS - 1 }, { expiresAt: Number.MAX_SAFE_INTEGER + 1 },
    { extra: true },
  ]) assert.equal(service.verify(signedEnvelope(JSON.stringify({ ...original, ...patch })), now), null, JSON.stringify(patch));
  const missing = { ...original };
  delete missing.formVersion;
  assert.equal(service.verify(signedEnvelope(JSON.stringify(missing)), now), null);
  for (const malformed of ['null', '[]', '42', '"text"', '{broken']) {
    assert.equal(service.verify(signedEnvelope(malformed), now), null);
  }
});

test('rejects duplicate JSON members and alternate wire representations', () => {
  const service = createTokenService(configuration);
  const original = issuedEnvelope();
  const json = JSON.stringify(original);
  assert.equal(service.verify(signedEnvelope(json.replace('{', '{"version":1,')), now), null);
  assert.equal(service.verify(signedEnvelope(` ${json}`), now), null);
  const reverse = Object.fromEntries(Object.entries(original).reverse());
  assert.equal(service.verify(signedEnvelope(JSON.stringify(reverse)), now), null);
});

test('rotates the signing key with verification overlap and stable fingerprints', () => {
  const oldService = createTokenService(configuration);
  const overlap = createTokenService({ activeKeyId: 'new', keys: { old: oldKey, new: newKey }, fingerprintKey });
  const retired = createTokenService({ activeKeyId: 'new', keys: { new: newKey }, fingerprintKey });
  const oldToken = oldService.issue(now);
  const newToken = overlap.issue(now);
  assert.deepEqual(overlap.verify(oldToken.token, now + 1), oldToken.claims);
  assert.deepEqual(overlap.verify(newToken.token, now + 1), newToken.claims);
  assert.equal(retired.verify(oldToken.token, now + 1), null);
  assert.deepEqual(retired.verify(newToken.token, now + 1), newToken.claims);
  assert.equal(oldService.verify(newToken.token, now + 1), null);
  assert.equal(oldService.fingerprint(enquiry), overlap.fingerprint(enquiry));
  assert.equal(overlap.fingerprint(enquiry), retired.fingerprint(enquiry));
});

test('captures key configuration instead of reading caller mutations during requests', () => {
  const options = { activeKeyId: 'old', keys: { old: oldKey }, fingerprintKey };
  const service = createTokenService(options);
  const issued = service.issue(now);
  options.keys.old = newKey;
  options.activeKeyId = 'changed';
  options.fingerprintKey = 'x'.repeat(32);
  assert.deepEqual(service.verify(issued.token, now), issued.claims);
  assert.equal(service.fingerprint(enquiry), createTokenService(configuration).fingerprint(enquiry));
});

test('fingerprints normalized values in a canonical order', () => {
  const service = createTokenService(configuration);
  const input = { ...enquiry, name: 'José Test', email: 'Person@EXAMPLE.TEST', message: 'One\nTwo' };
  const reordered = {
    story: '', message: 'One\r\nTwo', where: ' ', when: '',
    email: ' Person@example.test ', name: 'Jose\u0301 Test',
  } as Enquiry;
  const fingerprint = service.fingerprint(input);
  assert.match(fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(fingerprint, service.fingerprint(reordered));
  assert.notEqual(fingerprint, service.fingerprint({ ...input, email: 'person@example.test' }));
});

test('each meaningful enquiry field changes the fingerprint and invalid data is rejected', () => {
  const service = createTokenService(configuration);
  const original = service.fingerprint(enquiry);
  for (const change of [
    { name: 'Another Person' }, { email: 'other@example.test' }, { when: 'October' },
    { where: 'Pune' }, { message: 'One question' }, { story: 'couple-session' as const },
  ]) assert.notEqual(service.fingerprint({ ...enquiry, ...change }), original);
  assert.throws(() => service.fingerprint({ ...enquiry, email: 'not an address' }), /invalid enquiry/);
  assert.throws(() => service.fingerprint({ ...enquiry, extra: true } as Enquiry), /invalid enquiry/);
  const otherKey = createTokenService({ ...configuration, fingerprintKey: 'x'.repeat(32) });
  assert.notEqual(otherKey.fingerprint(enquiry), original);
});
