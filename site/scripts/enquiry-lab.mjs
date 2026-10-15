import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import ts from 'typescript';
import { startLocalPostgres } from './local-postgres.mjs';
import { PostgresEnquiryStore } from '../server/postgres-store.ts';
import { createTokenService } from '../server/tokens.ts';
import { createEnquiryApi } from '../server/http.ts';

const site = process.argv[2] === '--site';
if (process.argv.length > (site ? 3 : 2)) throw new Error('Use no arguments or --site.');
const port = site ? 4323 : 4322;
const origin = `http://127.0.0.1:${port}`;
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDirectory = join(root, 'dist-integration');
if (site && !readFileSync(join(siteDirectory, 'index.html'), 'utf8').includes('data-enquiry-active-form="true"')) {
  throw new Error('Build the local integration site first. The review site is not an active form.');
}
const client = ts.transpileModule(readFileSync(new URL('../src/scripts/enquiry-client.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText + `\nif (location.origin === ${JSON.stringify(origin)}) { const form = document.querySelector(${JSON.stringify(site ? '[data-enquiry-active-form]' : 'form')}); if (form) connectEnquiryForm(form, { synthetic: ${site} }); }`;
const html = readFileSync(new URL('./enquiry-lab.html', import.meta.url));
const css = `:root{font-family:system-ui,sans-serif;color:#242422;background:#FAFAF8}*{box-sizing:border-box}body{margin:0}main{max-width:46rem;margin:3rem auto;padding:0 1.25rem}h1{font-family:Georgia,serif;font-size:clamp(2rem,6vw,3.5rem);font-weight:500}.notice{background:#E5E7E3;padding:1rem;line-height:1.6}form{display:grid;gap:.55rem;margin-top:2rem}label{margin-top:.65rem}input,textarea,select,button{font:inherit;padding:.8rem;min-width:0;border:1px solid #405B4B;border-radius:2px}button{background:#405B4B;color:#FAFAF8;cursor:pointer}button:disabled{opacity:.65;cursor:default}:focus-visible{outline:3px solid #722F46;outline-offset:3px}[aria-invalid=true]{border:2px solid #722F46}[data-enquiry-errors]{padding:1rem;border:2px solid #722F46}[data-enquiry-status]{min-height:1.5em;overflow-wrap:anywhere}a{color:#722F46}p{line-height:1.6}[hidden]{display:none}`;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };

// Both labs use this one isolated runtime. Neither constructs a live provider.
const database = await startLocalPostgres({ database: site ? 'sevensteps_lab_site' : 'sevensteps_lab' });
const pool = new Pool({ connectionString: database.url, max: 3 });
try {
  await pool.query(readFileSync(new URL('../server/migrations/001-enquiries.sql', import.meta.url), 'utf8'));
  const store = new PostgresEnquiryStore(pool);
  const secret = () => randomBytes(32).toString('hex');
  const tokens = createTokenService({ activeKeyId: 'local', keys: { local: secret() }, fingerprintKey: secret() });
  const sender = { send: async (item) => ({ kind: 'accepted', providerId: item.id }) };
  const api = createEnquiryApi({ store, sender, tokens, origin,
    from: 'sender@example.invalid', to: 'operator@example.invalid', rateKey: secret() });
  const server = createServer(async (incoming, outgoing) => {
    if (incoming.headers.host !== `127.0.0.1:${port}`) { outgoing.writeHead(403).end(); return; }
    outgoing.setHeader('Cache-Control', 'no-store');
    outgoing.setHeader('X-Robots-Tag', 'noindex, nofollow');
    outgoing.setHeader('X-Content-Type-Options', 'nosniff');
    outgoing.setHeader('Referrer-Policy', 'no-referrer');
    outgoing.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
    if ((!site && incoming.url === '/lab.js') || (site && incoming.url === '/local-enquiry-client.js')) {
      if (incoming.method !== 'GET') { outgoing.writeHead(405).end(); return; }
      outgoing.writeHead(200, { 'Content-Type': 'text/javascript' }).end(client); return;
    }
    if (!site && incoming.method === 'GET' && ['/', '/lab.css'].includes(incoming.url)) {
      outgoing.writeHead(200, { 'Content-Type': incoming.url === '/' ? 'text/html; charset=utf-8' : 'text/css' })
        .end(incoming.url === '/' ? html : css); return;
    }
    try {
      if (site && !incoming.url.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(incoming.method)) { outgoing.writeHead(405).end(); return; }
        const url = new URL(incoming.url, origin);
        if (url.origin !== origin || url.search) { outgoing.writeHead(400).end(); return; }
        const pathname = decodeURIComponent(url.pathname);
        if (pathname.includes('\\') || pathname.includes('\0')) { outgoing.writeHead(400).end(); return; }
        const target = join(siteDirectory, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
        const resolved = await realpath(target);
        if (!resolved.startsWith(await realpath(siteDirectory) + sep) || !(await stat(resolved)).isFile()) {
          outgoing.writeHead(404).end(); return;
        }
        const type = types[extname(resolved)];
        if (!type) { outgoing.writeHead(404).end(); return; }
        let content = await readFile(resolved);
        if (extname(resolved) === '.html' && content.includes('data-enquiry-active-form="true"')) {
          content = Buffer.from(content.toString().replace('</body>', '<script type="module" src="/local-enquiry-client.js"></script></body>'));
        }
        outgoing.writeHead(200, { 'Content-Type': type }).end(incoming.method === 'HEAD' ? undefined : content); return;
      }
      const request = new Request(origin + incoming.url, {
        method: incoming.method, headers: incoming.headers,
        ...(incoming.method === 'GET' || incoming.method === 'HEAD' ? {} : { body: incoming, duplex: 'half' }),
      });
      const response = await api(request, { ip: incoming.socket.remoteAddress });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(await response.text());
    } catch { outgoing.writeHead(site && !incoming.url.startsWith('/api/') ? 404 : 503).end(); }
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
  server.on('error', async () => { console.error(`Local lab could not start. Check that port ${port} is free.`); await stop(1); });
  server.listen(port, '127.0.0.1', () => console.log(`Synthetic ${site ? 'website' : 'enquiry'} lab: ${origin}. No email delivery. Stop with Ctrl+C.`));
} catch (error) {
  try { await pool.end(); } finally { await database.stop(); }
  throw error;
}
