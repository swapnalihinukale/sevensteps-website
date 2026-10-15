import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { FORM_VERSION, TOKEN_TTL_MS, type Enquiry, type SubmissionToken } from './contracts.ts';
import { validateEnquiry } from './validation.ts';

interface TokenConfiguration {
  activeKeyId: string;
  keys: Record<string, string>;
  fingerprintKey: string;
}

interface TokenEnvelope extends SubmissionToken {
  version: 1;
  keyId: string;
}

const tokenDomain = 'seven-steps:submission-token:v1\n';
const fingerprintDomain = 'seven-steps:enquiry-fingerprint:v1\n';
const keyIdPattern = /^[A-Za-z0-9_-]{1,64}$/;
const tokenFields = ['version', 'keyId', 'id', 'formVersion', 'issuedAt', 'expiresAt'];
const maxTokenLength = 1024;

function secretBytes(value: unknown): Buffer {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') < 32 || Buffer.byteLength(value, 'utf8') > 4096) {
    throw new Error('Token and fingerprint secrets must contain between 32 and 4096 UTF-8 bytes.');
  }
  // Byte length checks size, not entropy. Configure cryptographically random
  // server secrets; never use these keys in client code or logs.
  return Buffer.from(value, 'utf8');
}

function validTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function signature(key: Buffer, encoded: string): Buffer {
  return createHmac('sha256', key).update(tokenDomain).update(encoded, 'ascii').digest();
}

function decodeBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const bytes = Buffer.from(value, 'base64url');
  return bytes.toString('base64url') === value ? bytes : null;
}

export function createTokenService(configuration: TokenConfiguration) {
  if (!configuration || typeof configuration.activeKeyId !== 'string' || !keyIdPattern.test(configuration.activeKeyId) || !configuration.keys || typeof configuration.keys !== 'object' || Array.isArray(configuration.keys)) {
    throw new Error('Configure an active signing key and its key ID.');
  }
  const keys = new Map<string, Buffer>();
  for (const [id, value] of Object.entries(configuration.keys)) {
    if (!keyIdPattern.test(id)) throw new Error('Signing key IDs must use letters, digits, underscores or hyphens.');
    keys.set(id, secretBytes(value));
  }
  const activeKey = keys.get(configuration.activeKeyId);
  if (!activeKey) throw new Error('The active signing key ID is missing from the key set.');
  const activeKeyId = configuration.activeKeyId;
  const fingerprintKey = secretBytes(configuration.fingerprintKey);
  if ([...keys.values()].some((key) => key.equals(fingerprintKey))) {
    throw new Error('Use a separate fingerprint secret that stays fixed during token-key rotation.');
  }

  return {
    issue(now = Date.now()): { token: string; claims: SubmissionToken } {
      if (!validTime(now) || now > Number.MAX_SAFE_INTEGER - TOKEN_TTL_MS) throw new Error('Use a valid millisecond timestamp when issuing a token.');
      const claims: SubmissionToken = {
        id: randomBytes(16).toString('hex'), formVersion: FORM_VERSION,
        issuedAt: now, expiresAt: now + TOKEN_TTL_MS,
      };
      const envelope: TokenEnvelope = { version: 1, keyId: activeKeyId, ...claims };
      const encoded = Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64url');
      return { token: `${encoded}.${signature(activeKey, encoded).toString('base64url')}`, claims };
    },

    verify(token: unknown, now = Date.now()): SubmissionToken | null {
      if (typeof token !== 'string' || token.length > maxTokenLength || !validTime(now)) return null;
      const parts = token.split('.');
      if (parts.length !== 2 || parts[1].length !== 43) return null;
      const payload = decodeBase64Url(parts[0]);
      const suppliedSignature = decodeBase64Url(parts[1]);
      if (!payload || !suppliedSignature || suppliedSignature.length !== 32) return null;
      let envelope: TokenEnvelope;
      let serialized: string;
      try {
        serialized = new TextDecoder('utf-8', { fatal: true }).decode(payload);
        const parsed: unknown = JSON.parse(serialized);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
        if (Object.keys(parsed).length !== tokenFields.length || Object.keys(parsed).some((field) => !tokenFields.includes(field))) return null;
        envelope = parsed as TokenEnvelope;
      } catch { return null; }
      if (envelope.version !== 1 || typeof envelope.keyId !== 'string' || !keyIdPattern.test(envelope.keyId)) return null;
      const key = keys.get(envelope.keyId);
      if (!key || !timingSafeEqual(signature(key, parts[0]), suppliedSignature)) return null;
      if (typeof envelope.id !== 'string' || !/^[a-f0-9]{32}$/.test(envelope.id) || envelope.formVersion !== FORM_VERSION) return null;
      if (!validTime(envelope.issuedAt) || !validTime(envelope.expiresAt) || envelope.expiresAt - envelope.issuedAt !== TOKEN_TTL_MS) return null;
      if (envelope.issuedAt > now || envelope.expiresAt <= now) return null;
      const canonical: TokenEnvelope = {
        version: 1, keyId: envelope.keyId, id: envelope.id, formVersion: envelope.formVersion,
        issuedAt: envelope.issuedAt, expiresAt: envelope.expiresAt,
      };
      // Reject duplicate JSON members, alternative encodings and extra syntax,
      // even when a caller supplied a valid signature for that representation.
      if (JSON.stringify(canonical) !== serialized) return null;
      return { id: envelope.id, formVersion: envelope.formVersion, issuedAt: envelope.issuedAt, expiresAt: envelope.expiresAt };
    },

    fingerprint(enquiry: Enquiry): string {
      const checked = validateEnquiry(enquiry);
      if (!checked.ok) throw new Error('Cannot fingerprint an invalid enquiry.');
      const { name, email, when, where, message, story } = checked.value;
      const canonical = JSON.stringify({ name, email, when, where, message, story });
      return createHmac('sha256', fingerprintKey).update(fingerprintDomain).update(canonical, 'utf8').digest('hex');
    },
  };
}
