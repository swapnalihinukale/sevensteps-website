import { getDatabase } from '@netlify/database';
import { readLiveConfig } from './config.ts';
import { createTokenService } from './tokens.ts';
import { PostgresEnquiryStore } from './postgres-store.ts';
import { ResendSender } from './resend-sender.ts';
import { createEnquiryApi } from './http.ts';

export function createLiveRuntime(env: NodeJS.ProcessEnv = process.env) {
  // Validate the activation boundary before constructing a pool or mail client.
  const config = readLiveConfig(env);
  const tokens = createTokenService(config);
  const connection = getDatabase({ connectionString: config.databaseUrl, debug: false });
  connection.pool.options.max = 3;
  connection.pool.options.connectionTimeoutMillis = 3_000;
  connection.pool.options.idleTimeoutMillis = 10_000;
  connection.pool.options.statement_timeout = 3_000;
  connection.pool.options.query_timeout = 5_000;
  connection.pool.options.idle_in_transaction_session_timeout = 5_000;
  const diagnostic = (code: string) => console.error(JSON.stringify({ code }));
  connection.pool.on('error', () => diagnostic('enquiry_pool_error'));
  const store = new PostgresEnquiryStore(connection.pool);
  const sender = new ResendSender({ apiKey: config.apiKey, from: config.from, to: config.to });
  return { config, store, sender, diagnostic, close: () => connection.pool.end(),
    api: createEnquiryApi({ ...config, tokens, store, sender, diagnostic }) };
}
