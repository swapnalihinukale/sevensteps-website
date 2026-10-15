import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const output = process.argv[2] ?? 'dist';
if (!['dist', 'dist-fixture', 'dist-integration'].includes(output)) throw new Error('Choose a known build directory.');
const root = resolve(output);
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(join(dir, item.name)) : [join(dir, item.name)]); }
const pages = walk(root).filter(path => path.endsWith('.html'));
const failures = [];
let links = 0;
// Generated Astro attributes use double quotes. This checks our static output,
// not arbitrary third-party HTML or JavaScript-generated destinations.
const idsFor = html => [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
for (const path of pages) {
  const html = readFileSync(path, 'utf8');
  const ids = idsFor(html);
  if (new Set(ids).size !== ids.length) failures.push(`${path}: duplicate document IDs`);
  const base = 'http://127.0.0.1:4321' + path.slice(root.length).replace(/index\.html$/, '');
  const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  for (const [, srcset] of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const candidate of srcset.split(',')) references.push(candidate.trim().split(/\s+/)[0]);
  }
  for (const href of references) {
    const url = new URL(href, base);
    if (url.origin !== 'http://127.0.0.1:4321') continue;
    links++;
    let target = join(root, decodeURIComponent(url.pathname));
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) failures.push(`${path}: missing ${href}`);
    else if (url.hash && target.endsWith('.html') && !idsFor(readFileSync(target, 'utf8')).includes(decodeURIComponent(url.hash.slice(1)))) failures.push(`${path}: missing fragment ${href}`);
  }
}
const result = { timestamp: new Date().toISOString(), pages: pages.length, links, failures };
writeFileSync(`docs/audits/static-links${output === 'dist' ? '' : `-${output}`}.json`, JSON.stringify(result, null, 2) + '\n');
console.log(`${failures.length ? 'FAIL' : 'PASS'}: ${links} local links/assets and IDs across ${pages.length} documents.`);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
