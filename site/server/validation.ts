import type { Enquiry } from './contracts.ts';
import { domainToASCII } from 'node:url';

export type EnquiryValidation =
  | { ok: true; value: Enquiry }
  | { ok: false; errors: Record<string, string> };

const fields = ['name', 'email', 'when', 'where', 'message', 'story'] as const;
const unsafeCharacters = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}]/u;
const nameCharacters = /^[\p{L}\p{M}\p{N}\p{Zs}'’.\-\u00b7\u2010\u2011\u200c\u200d]+$/u;

function hasUnsafeCharacters(value: string, multiline = false): boolean {
  // Joiners are meaningful in several writing systems. Other format controls,
  // including directional overrides, are not accepted in these plain fields.
  let inspected = value.replace(/[\u200c\u200d]/gu, '');
  if (multiline) inspected = inspected.replace(/[\n\t]/g, '');
  return unsafeCharacters.test(inspected);
}

function length(value: string): number {
  return [...value].length;
}

/** A practical mailbox parser, not a promise that the address receives mail. */
export function normalizeEmailAddress(input: unknown): string | null {
  if (typeof input !== 'string' || hasUnsafeCharacters(input)) return null;
  const value = input.trim().normalize('NFC');
  if (Buffer.byteLength(value, 'utf8') > 254) return null;
  const parts = value.split('@');
  if (parts.length !== 2) return null;
  const [local, rawDomain] = parts;
  if (!local || local.length > 64 || !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return null;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (!rawDomain || /[\s<>"(),;:\[\]\\/%?#]/u.test(rawDomain)) return null;
  const domain = domainToASCII(rawDomain).toLowerCase();
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  if (!/[a-z]/.test(labels.at(-1)!)) return null;
  const normalized = `${local}@${domain}`;
  return Buffer.byteLength(normalized, 'utf8') <= 254 ? normalized : null;
}

export function validateEnquiry(input: unknown): EnquiryValidation {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: { _form: 'Send an enquiry as a JSON object.' } };
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    return { ok: false, errors: { _form: 'Send an enquiry as a plain JSON object.' } };
  }
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (Reflect.ownKeys(descriptors).some((key) => typeof key !== 'string' || !fields.includes(key as typeof fields[number]))) {
    errors._form = 'Send only the supported enquiry fields.';
  }
  if (Object.values(descriptors).some((descriptor) => !('value' in descriptor) || descriptor.enumerable !== true)) {
    return { ok: false, errors: { _form: 'Send enquiry fields as plain JSON values.' } };
  }
  const source = input as Record<string, unknown>;
  const value: Enquiry = { name: '', email: '', when: '', where: '', message: '', story: '' };
  for (const field of fields) {
    const raw = Object.hasOwn(source, field) ? source[field] : undefined;
    if (raw === undefined && !Object.hasOwn(source, field) && field !== 'name' && field !== 'email') continue;
    if (typeof raw !== 'string') {
      errors[field] = field === 'name' ? 'Enter your name.' : field === 'email' ? 'Enter an email address so we can reply.' : 'Use plain text for this field.';
      continue;
    }
    // Normalise Windows newlines in the message. Lone carriage returns and
    // all controls in single-line fields are rejected before trimming.
    const lineNormalized = field === 'message' ? raw.replace(/\r\n/g, '\n') : raw;
    if (hasUnsafeCharacters(lineNormalized, field === 'message')) {
      errors[field] = 'Remove unsupported control characters from this field.';
      continue;
    }
    const text = lineNormalized.trim().normalize('NFC');
    if (field === 'name') {
      if (length(text) < 1 || length(text) > 100) errors.name = 'Use between 1 and 100 characters for your name.';
      else if (!nameCharacters.test(text) || !/[\p{L}\p{N}]/u.test(text)) errors.name = 'Use your name with letters, spaces and ordinary name punctuation.';
      else value.name = text;
    } else if (field === 'email') {
      const email = normalizeEmailAddress(raw);
      if (!email) errors.email = 'Enter a valid email address of at most 254 bytes.';
      else value.email = email;
    } else if (field === 'story') {
      if (text !== '' && text !== 'wedding-story' && text !== 'couple-session') errors.story = 'Choose one of the available stories or leave it unselected.';
      else value.story = text;
    } else {
      const limit = field === 'when' ? 120 : field === 'where' ? 200 : 4000;
      if (length(text) > limit) errors[field] = `Use at most ${limit} characters for this field.`;
      else value[field] = text;
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
