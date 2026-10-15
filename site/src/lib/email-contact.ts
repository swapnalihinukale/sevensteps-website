import { normalizeEmailAddress } from '../../server/validation.ts';

/** Build only a mailbox target. Public content cannot add mail headers or fragments. */
export function emailContact(input: unknown): { address: string; href: string } {
  const address = normalizeEmailAddress(input);
  if (!address) throw new Error('contact.email: use a valid confirmed mailbox.');
  const separator = address.indexOf('@');
  const local = address.slice(0, separator);
  const domain = address.slice(separator + 1);
  return { address, href: `mailto:${encodeURIComponent(local)}@${domain}` };
}
