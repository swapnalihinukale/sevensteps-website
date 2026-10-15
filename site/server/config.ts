import { normalizeEmailAddress } from './validation.ts';

export function readLiveConfig(env: NodeJS.ProcessEnv) {
  if (env.ENQUIRY_MODE !== 'live' || env.ENQUIRY_ACTIVATION !== 'approved' ||
    env.CONTEXT !== 'production' || env.NODE_ENV !== 'production') {
    throw new Error('Live enquiries are disabled');
  }
  if (env.NETLIFY_DB_DRIVER && env.NETLIFY_DB_DRIVER !== 'server') {
    throw new Error('The reviewed PostgreSQL server driver is required');
  }
  const required = (key: string) => {
    const value = env[key];
    if (!value || value !== value.trim()) throw new Error('Incomplete enquiry configuration');
    return value;
  };
  const origin = required('SITE_ORIGIN');
  const url = new URL(origin);
  if (url.origin !== origin || url.protocol !== 'https:' ||
    /^(localhost|127\.|\[::1\])/.test(url.hostname)) throw new Error('Invalid public origin');
  const from = normalizeEmailAddress(required('ENQUIRY_FROM'));
  const to = normalizeEmailAddress(required('ENQUIRY_TO'));
  if (!from || !to) throw new Error('Invalid enquiry routing');
  const databaseUrl = required('NETLIFY_DB_URL');
  const database = new URL(databaseUrl);
  const connectionOptions = new Set(['sslmode', 'channel_binding', 'options', 'application_name', 'connect_timeout']);
  if (!['postgres:', 'postgresql:'].includes(database.protocol) ||
    [...database.searchParams.keys()].some(key => !connectionOptions.has(key) || database.searchParams.getAll(key).length !== 1) ||
    database.searchParams.get('sslmode') !== 'verify-full' || database.hash) {
    throw new Error('Database certificate verification is required');
  }
  let keys: Record<string, string>;
  try { keys = JSON.parse(required('ENQUIRY_TOKEN_KEYS')); }
  catch { throw new Error('Invalid token configuration'); }
  const fingerprintKey = required('ENQUIRY_FINGERPRINT_KEY');
  const rateKey = required('ENQUIRY_RATE_KEY');
  if (Buffer.byteLength(rateKey) < 32 || rateKey === fingerprintKey) {
    throw new Error('Independent rate key is required');
  }
  return {
    origin, from, to, databaseUrl, keys, fingerprintKey, rateKey,
    activeKeyId: required('ENQUIRY_TOKEN_KEY_ID'),
    apiKey: required('RESEND_API_KEY'), webhookSecret: required('RESEND_WEBHOOK_SECRET'),
  };
}
