import { createServer } from 'node:http';
import { verifyReviewDist, reviewHeaders } from './package-review.mjs';
import { resolve, extname } from 'node:path';

// Use the same verified byte snapshot and headers as the upload, without ZIP or disk writes.
const files = verifyReviewDist(resolve('dist'));
const origin = 'http://127.0.0.1:4325';
const headers = Object.fromEntries(reviewHeaders.trim().split('\n').slice(1).map(line => {
  const split = line.indexOf(':');
  return [line.slice(0, split).trim(), line.slice(split + 1).trim()];
}));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((request, response) => {
  for (const [key, value] of Object.entries(headers)) response.setHeader(key, value);
  if (request.headers.host !== '127.0.0.1:4325') { response.writeHead(403).end(); return; }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  try {
    const url = new URL(request.url, origin);
    if (url.origin !== origin) { response.writeHead(403).end(); return; }
    let path = decodeURIComponent(url.pathname).slice(1);
    if (!path || path.endsWith('/')) path += 'index.html';
    const found = files.get(path);
    const body = found ?? files.get('404.html');
    response.writeHead(found ? 200 : 404, { 'Content-Type': found ? types[extname(path)] : types['.html'], 'Content-Length': body.length });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(400).end(); }
});
server.on('error', () => { console.error('Owner review preview could not bind to port 4325.'); process.exitCode = 1; });
function stop() { server.closeAllConnections(); server.close(); }
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
server.listen(4325, '127.0.0.1', () => console.log(`Owner review with upload security headers: ${origin}. Restart after rebuilding.`));
