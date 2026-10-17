import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEmailAddress, validateEnquiry } from '../../server/validation.ts';
import { createNotificationPayload } from '../../server/notification-payload.ts';
import type { Enquiry } from '../../server/contracts.ts';

const enquiry: Enquiry = {
  name: 'Test Person', email: 'person@example.test', when: '', where: '', message: '', story: '',
};

test('normalizes a valid enquiry without coercing types or adding business facts', () => {
  assert.deepEqual(validateEnquiry({
    name: '  Jose\u0301 Test  ', email: 'Person+Test@EXAMPLE.TEST',
    when: ' October ', where: ' Pune ', message: 'First line\r\nSecond line\tMore', story: ' wedding-story ',
  }), { ok: true, value: {
    name: 'José Test', email: 'Person+Test@example.test', when: 'October', where: 'Pune',
    message: 'First line\nSecond line\tMore', story: 'wedding-story',
  } });
  assert.deepEqual(validateEnquiry({ name: enquiry.name, email: enquiry.email }), { ok: true, value: enquiry });
  assert.deepEqual(validateEnquiry({ ...enquiry, when: '  ', where: ' ', message: '\n\t  ', story: ' ' }), { ok: true, value: enquiry });
});

test('accepts international names and ordinary name punctuation', () => {
  for (const name of ['योगेश रेपाळे', '李小龍', 'می\u200cنا', 'Anne-Marie O’Connor', "Jean D'Arc", 'A. Test', '𐐀'.repeat(100)]) {
    assert.equal(validateEnquiry({ ...enquiry, name }).ok, true, name);
  }
  for (const name of ['', '   ', '--', '<script>Test</script>', 'A'.repeat(101)]) {
    const result = validateEnquiry({ ...enquiry, name });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.name);
  }
});

test('enforces each documented character limit and the mailbox byte limit', () => {
  for (const [field, limit] of [['name', 100], ['when', 120], ['where', 200], ['message', 4000]] as const) {
    assert.equal(validateEnquiry({ ...enquiry, [field]: 'A'.repeat(limit) }).ok, true, field);
    const result = validateEnquiry({ ...enquiry, [field]: 'A'.repeat(limit + 1) });
    assert.equal(result.ok, false, field);
    if (!result.ok) assert.ok(result.errors[field]);
  }
  const boundaryEmail = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
  assert.equal(boundaryEmail.length, 254);
  assert.equal(normalizeEmailAddress(boundaryEmail), boundaryEmail);
  assert.equal(normalizeEmailAddress(`${boundaryEmail}d`), null);
});

test('rejects non-objects, inherited records, extra keys and accessors without invoking them', () => {
  for (const input of [null, undefined, [], 'text', 42, true, new Date(), Object.create(enquiry)]) {
    assert.equal(validateEnquiry(input).ok, false);
  }
  assert.equal(validateEnquiry({ ...enquiry, recipient: 'other@example.test' }).ok, false);
  assert.equal(validateEnquiry(JSON.parse('{"name":"Test","email":"person@example.test","__proto__":{"polluted":true}}')).ok, false);
  assert.equal(Object.hasOwn(Object.prototype, 'polluted'), false);
  let read = false;
  const accessor = { ...enquiry, get message() { read = true; return 'not JSON'; } };
  assert.equal(validateEnquiry(accessor).ok, false);
  assert.equal(read, false);
  const withSymbol = { ...enquiry, [Symbol('unexpected')]: 'not JSON' };
  assert.equal(validateEnquiry(withSymbol).ok, false);
  assert.equal(validateEnquiry(Object.assign(Object.create(null), enquiry)).ok, true);
});

test('requires string values, including optional fields when present', () => {
  for (const field of Object.keys(enquiry)) {
    for (const value of [null, undefined, 1, false, [], {}, new String('text')]) {
      const result = validateEnquiry({ ...enquiry, [field]: value });
      assert.equal(result.ok, false, `${field}: ${typeof value}`);
      if (!result.ok) assert.ok(result.errors[field]);
    }
  }
  const missing = validateEnquiry({});
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.deepEqual(Object.keys(missing.errors).sort(), ['email', 'name']);
});

test('rejects control characters before trimming and only permits message line feeds and tabs', () => {
  const controls = [...Array.from({ length: 32 }, (_, n) => n), ...Array.from({ length: 33 }, (_, n) => n + 127)];
  for (const code of controls) {
    const character = String.fromCodePoint(code);
    for (const field of ['name', 'email', 'when', 'where', 'story']) {
      assert.equal(validateEnquiry({ ...enquiry, [field]: `${character}${enquiry[field as keyof Enquiry]}` }).ok, false, `${field}: ${code}`);
    }
    const result = validateEnquiry({ ...enquiry, message: `Before${character}after` });
    assert.equal(result.ok, code === 9 || code === 10, `message: ${code}`);
  }
  assert.equal(validateEnquiry({ ...enquiry, message: 'Before\r\nafter' }).ok, true);
});

test('rejects directional spoofing, hidden controls, invalid Unicode and header injection', () => {
  for (const code of [0x202e, 0x202a, 0x2066, 0x200b, 0xfeff, 0x2028, 0x2029, 0xd800]) {
    for (const field of ['name', 'where', 'message']) {
      assert.equal(validateEnquiry({ ...enquiry, [field]: `Test${String.fromCodePoint(code)}text` }).ok, false);
    }
  }
  for (const email of ['person@example.test\r\nBcc: other@example.test', '\nperson@example.test', 'Person <person@example.test>', 'person@example.test,other@example.test']) {
    assert.equal(normalizeEmailAddress(email), null);
  }
});

test('uses a bounded practical mailbox format and preserves local-part case', () => {
  assert.equal(normalizeEmailAddress('  Person+tag@EXAMPLE.TEST  '), 'Person+tag@example.test');
  assert.equal(normalizeEmailAddress('person@bücher.example'), 'person@xn--bcher-kva.example');
  for (const email of [
    'a..b@example.test', '.name@example.test', 'name.@example.test', 'name@@example.test',
    'name@localhost', 'name@-example.test', 'name@example-.test', 'name@example..test',
    'name@example.test.', 'name@[127.0.0.1]', 'नाम@example.test', 'name@example.test/path',
    'name@example.test%0d%0aBcc', `${'a'.repeat(65)}@example.test`, 'name@123.456',
  ]) assert.equal(normalizeEmailAddress(email), null, email);
});

test('accepts optional portfolio slugs without depending on the current story list', () => {
  for (const story of ['', 'wedding-story', 'couple-session', 'family-at-home', '2026-portraits', 'a', 'a'.repeat(80)]) {
    assert.deepEqual(validateEnquiry({ ...enquiry, story }), { ok: true, value: { ...enquiry, story } });
  }
  assert.deepEqual(validateEnquiry({ ...enquiry, story: ' family-at-home ' }), {
    ok: true, value: { ...enquiry, story: 'family-at-home' },
  });
  const { story: _story, ...withoutStory } = enquiry;
  assert.deepEqual(validateEnquiry(withoutStory), { ok: true, value: enquiry });
});

test('rejects oversized and malformed story paths instead of interpreting them as URLs or titles', () => {
  for (const story of ['a'.repeat(81), 'Wedding-story', '../private', 'a/b', 'a?to=other', 'a#frame', 'a%2fb',
    '-story', 'story-', 'two--parts', 'two_parts', 'two words', 'कथा', 'story\r\nBcc:other', 'story\u200d']) {
    const result = validateEnquiry({ ...enquiry, story });
    assert.equal(result.ok, false, story);
    if (!result.ok) assert.ok(result.errors.story);
  }
});

test('builds an immutable notification with fixed headers and a plain text body', () => {
  const value = { ...enquiry, name: 'योगेश Test', story: 'wedding-story' as const, message: '<b>Literal text</b>\nA second line' };
  const payload = createNotificationPayload(value, { from: 'Sender@EXAMPLE.TEST', to: 'operator@example.test' });
  assert.deepEqual(Object.keys(payload).sort(), ['from', 'replyTo', 'subject', 'text', 'to']);
  assert.equal(payload.from, 'Sender@example.test');
  assert.equal(payload.to, 'operator@example.test');
  assert.equal(payload.replyTo, enquiry.email);
  assert.equal(payload.subject, 'New website enquiry');
  assert.ok(!payload.subject.includes(value.name) && !payload.subject.includes(value.email));
  assert.ok(payload.text.includes('<b>Literal text</b>\nA second line'));
  assert.ok(payload.text.includes('Story: Wedding story'));
  assert.ok(payload.text.includes('When: Not provided'));
  assert.equal(Object.hasOwn(payload, 'html'), false);
  assert.equal(Object.isFrozen(payload), true);
  assert.throws(() => { payload.subject = 'Changed'; }, TypeError);
});

test('cannot create notification headers from invalid enquiries or configured mailboxes', () => {
  const recipients = { from: 'sender@example.test', to: 'operator@example.test' };
  assert.throws(() => createNotificationPayload({ ...enquiry, email: 'person@example.test\nBcc: x@example.test' }, recipients), /invalid enquiry/);
  assert.throws(() => createNotificationPayload(enquiry, { ...recipients, from: 'Sender <sender@example.test>' }), /bare sender/);
  assert.throws(() => createNotificationPayload(enquiry, { ...recipients, to: 'operator@example.test\r\nBcc: x@example.test' }), /bare sender/);
  assert.equal(createNotificationPayload(enquiry, recipients).text.endsWith('No message provided.'), true);
});

test('new portfolio slugs stay visible in notification text while legacy labels stay unchanged', () => {
  const recipients = { from: 'sender@example.test', to: 'operator@example.test' };
  for (const [story, label] of [['', 'Not selected'], ['wedding-story', 'Wedding story'], ['couple-session', 'Couple session'], ['family-at-home', 'family-at-home']]) {
    const payload = createNotificationPayload({ ...enquiry, story }, recipients);
    assert.ok(payload.text.split('\n').includes(`Story: ${label}`));
    assert.equal(payload.subject, 'New website enquiry');
    assert.equal(payload.to, recipients.to);
  }
  assert.throws(() => createNotificationPayload({ ...enquiry, story: 'family?to=other' }, recipients), /invalid enquiry/);
});
