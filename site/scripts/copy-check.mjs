import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const output = process.argv[2] ?? 'dist';
if (!['dist', 'dist-fixture', 'dist-integration'].includes(output)) throw new Error('Choose a known build directory.');
const roots = ['src', 'server', 'netlify', output];
const matches = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(astro|ts|json|html|js|css)$/.test(path)) {
      const source = readFileSync(path, 'utf8');
      if (/\u2014|&mdash;|&#0*8212;|&#x0*2014;|\\u2014|\\u\{2014\}/i.test(source)) matches.push(path);
    }
  }
}
roots.filter(existsSync).forEach(walk);
if (matches.length) { console.error('COPY-01/03 forbidden punctuation:', matches); process.exit(1); }
console.log('COPY-01/03: source and existing build contain no em dash or encoded equivalents.');
