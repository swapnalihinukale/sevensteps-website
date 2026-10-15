import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import ts from 'typescript';
import { startLocalPostgres } from './local-postgres.mjs';
import { PostgresEnquiryStore } from '../server/postgres-store.ts';
import { createTokenService } from '../server/tokens.ts';
import { createEnquiryApi } from '../server/http.ts';

const database = await startLocalPostgres({ database: 'sevensteps_lab' });
const pool = new Pool({ connectionString: database.url, max: 3 });
try {
await pool.query(readFileSync(new URL('../server/migrations/001-enquiries.sql', import.meta.url), 'utf8'));
const store = new PostgresEnquiryStore(pool);
const secret = () => randomBytes(32).toString('hex');
const tokens = createTokenService({ activeKeyId: 'local', keys: { local: secret() }, fingerprintKey: secret() });
const port = 4322;
const origin = `http://127.0.0.1:${port}`;
// The lab does not construct the Resend adapter or read any live credentials.
const sender = { send: async (item) => ({ kind: 'accepted', providerId: item.id }) };
const api = createEnquiryApi({ store, sender, tokens, origin,
  from: 'sender@example.invalid', to: 'operator@example.invalid', rateKey: secret() });
const client = ts.transpileModule(readFileSync(new URL('../src/scripts/enquiry-client.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText + '\nconnectEnquiryForm(document.querySelector("form"));';
const html = readFileSync(new URL('./enquiry-lab.html', import.meta.url));
const css = `:root{font-family:system-ui,sans-serif;color:#242422;background:#FAFAF8}*{box-sizing:border-box}body{margin:0}main{max-width:46rem;margin:3rem auto;padding:0 1.25rem}h1{font-family:Georgia,serif;font-size:clamp(2rem,6vw,3.5rem);font-weight:500}.notice{background:#E5E7E3;padding:1rem;line-height:1.6}form{display:grid;gap:.55rem;margin-top:2rem}label{margin-top:.65rem}input,textarea,select,button{font:inherit;padding:.8rem;min-width:0;border:1px solid #405B4B;border-radius:2px}button{background:#405B4B;color:#FAFAF8;cursor:pointer}button:disabled{opacity:.65;cursor:default}:focus-visible{outline:3px solid #722F46;outline-offset:3px}[aria-invalid=true]{border:2px solid #722F46}[data-enquiry-errors]{padding:1rem;border:2px solid #722F46}[data-enquiry-status]{min-height:1.5em;overflow-wrap:anywhere}a{color:#722F46}p{line-height:1.6}[hidden]{display:none}`;
const server = createServer(async (incoming, outgoing) => {
  if (incoming.headers.host !== `127.0.0.1:${port}`) { outgoing.writeHead(403).end(); return; }
  outgoing.setHeader('Cache-Control', 'no-store');
  outgoing.setHeader('X-Robots-Tag', 'noindex, nofollow');
  outgoing.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  if (incoming.url === '/' && incoming.method === 'GET') {
    outgoing.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html); return;
  }
  if (incoming.url === '/lab.js' || incoming.url === '/lab.css') {
    outgoing.writeHead(200, { 'Content-Type': incoming.url.endsWith('.js') ? 'text/javascript' : 'text/css' })
      .end(incoming.url.endsWith('.js') ? client : css); return;
  }
  try {
    const request = new Request(origin + incoming.url, {
      method: incoming.method, headers: incoming.headers,
      ...(incoming.method === 'GET' || incoming.method === 'HEAD' ? {} : { body: incoming, duplex: 'half' }),
    });
    const response = await api(request, { ip: incoming.socket.remoteAddress });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(await response.text());
  } catch { outgoing.writeHead(503).end(); }
});
let stopped = false;
async function stop(exitCode = 0) {
  if (stopped) return;
  stopped = true;
  server.closeAllConnections(); server.close();
  try { await pool.end(); } finally { await database.stop(); }
  process.exit(exitCode);
}
process.once('SIGINT', () => stop()); process.once('SIGTERM', () => stop());
server.on('error', async () => { console.error('Local lab could not start. Check that port 4322 is free.'); await stop(1); });
server.listen(port, '127.0.0.1', () => console.log(`Synthetic enquiry lab: ${origin}. No email delivery. Stop with Ctrl+C.`));
} catch (error) {
  try { await pool.end(); } finally { await database.stop(); }
  throw error;
}
