import { createServer } from 'node:http';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, join, extname, sep } from 'node:path';
import { checkPublicArtifact } from './check-public-artifact.mjs';

const root = realpathSync(resolve('dist-fixture'));
const check = checkPublicArtifact(root, 'fixture');
if (check.failures.length) throw new Error('Fixture artifact is incomplete. Run build:fixture first.');
const origin = 'http://127.0.0.1:4324';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  if (request.headers.host !== '127.0.0.1:4324') { response.writeHead(403).end(); return; }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  try {
    const url = new URL(request.url, origin);
    if (url.origin !== origin) { response.writeHead(403).end(); return; }
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    path = realpathSync(path);
    if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const body = readFileSync(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Content-Length': body.length });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : readFileSync(join(root, '404.html')));
  }
});
server.on('error', () => { console.error('Fixture preview could not bind to port 4324.'); process.exitCode = 1; });
function stop() { server.closeAllConnections(); server.close(); }
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
server.listen(4324, '127.0.0.1', () => console.log(`Synthetic media fixture: ${origin}. These patterns are test assets.`));
