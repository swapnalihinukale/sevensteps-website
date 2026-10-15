import assert from 'node:assert/strict';
import test from 'node:test';
import { emailContact } from '../src/lib/email-contact.ts';

test('mailto encodes mailbox punctuation without creating headers or fragments', () => {
  for (const address of ['hello?cc=other@studio.com', 'hello#part@studio.com', 'hello%3Fcc=other@studio.com', 'hello&bcc=other@studio.com']) {
    const contact = emailContact(address);
    const target = new URL(contact.href);
    assert.equal(target.protocol, 'mailto:');
    assert.equal(target.search, '');
    assert.equal(target.hash, '');
    assert.equal(decodeURIComponent(target.pathname), address);
    assert.equal(contact.address, address);
  }
});

test('public contact uses the enquiry parser for dots, domains and header controls', () => {
  for (const address of ['.hello@studio.com', 'hello.@studio.com', 'hello..there@studio.com', 'hello@-studio.com', 'hello@studio..com', 'hello@studio.com\r\nBcc: other@studio.com']) {
    assert.throws(() => emailContact(address), /valid confirmed mailbox/);
  }
});

test('international domains normalize before building the mailbox URI', () => {
  assert.deepEqual(emailContact('Hello@BÜCHER.de'), {
    address: 'Hello@xn--bcher-kva.de', href: 'mailto:Hello@xn--bcher-kva.de',
  });
});
