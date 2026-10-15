import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { packageReview, reviewHeaders, verifyReviewDist } from '../scripts/package-review.mjs';

const metadata = { createdAt: '2026-10-16T09:00:00.000Z', sourceCommit: 'a'.repeat(40), sourceTree: 'clean' };
const styles = '/_astro/review.12345678.css';
const module = '/_astro/review.12345678.js';
const form = '<form data-enquiry-form="true" novalidate><label>Your name<input id="enquiry-name"></label><textarea id="enquiry-note"></textarea><button type="button" disabled>Sending is not set up</button></form><p>Photograph to add</p><p>This draft does not send or save them.</p>';
const checklist = Array.from({ length: 27 }, (_, index) => `<article id="slot-${index}" data-slot-item>Content to add</article>`).join('');
const page = content => `<!doctype html><html><head><meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="${styles}"></head><body><aside>Website draft. <a href="/content-checklist/">View content checklist</a></aside>${content}<script type="module" src="${module}"></script></body></html>`;

function fixture(run) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'sevensteps-review-package-')));
  const dist = join(root, 'dist');
  const output = join(root, '.review-package');
  const files = {
    'index.html': page(form), '404.html': page('Page not found'),
    'stories/wedding-story/index.html': page(form), 'stories/couple-session/index.html': page(form),
    'content-checklist/index.html': page(checklist),
    'robots.txt': 'User-agent: *\nDisallow: /\n',
    'sitemap.xml': '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
    'favicon.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><path d="M0 0h4v4z"/></svg>',
    'licenses/source-sans-3-OFL.txt': 'Test font licence', 'licenses/source-serif-4-OFL.txt': 'Test font licence',
    '_astro/review.12345678.js': 'document.documentElement.dataset.motion="still";',
    '_astro/review.12345678.css': '@font-face{font-family:Sans;src:url(/_astro/source-sans-3-latin-wght-normal.12345678.woff2)}@font-face{font-family:Serif;src:url(/_astro/source-serif-4-latin-wght-normal.87654321.woff2)}',
    '_astro/source-sans-3-latin-wght-normal.12345678.woff2': Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(12)]),
    '_astro/source-serif-4-latin-wght-normal.87654321.woff2': Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(12)]),
  };
  for (const [name, content] of Object.entries(files)) { mkdirSync(dirname(join(dist, name)), { recursive: true }); writeFileSync(join(dist, name), content); }
  const build = extra => packageReview({ sourceDirectory: dist, packageDirectory: output, metadata, ...extra });
  const edit = (name, transform) => writeFileSync(join(dist, name), transform(readFileSync(join(dist, name), 'utf8')));
  try { return run({ root, dist, output, files, build, edit }); } finally { rmSync(root, { recursive: true, force: true }); }
}

test('exports only verified static files and generated headers, with evidence outside upload', () => fixture(({ dist, output, files, build }) => {
  const original = new Map(Object.keys(files).map(path => [path, readFileSync(join(dist, path))]));
  const result = build();
  assert.equal(result.kind, 'owner-review-placeholder');
  assert.equal(result.sourceCommit, metadata.sourceCommit);
  assert.equal(result.files.length, Object.keys(files).length + 1);
  assert.equal(readFileSync(join(output, 'upload/_headers'), 'utf8'), reviewHeaders);
  assert.ok(existsSync(join(output, 'manifest.json')));
  assert.ok(!existsSync(join(output, 'upload/manifest.json')));
  assert.ok(!existsSync(join(output, 'upload/server')));
  for (const [path, bytes] of original) {
    assert.deepEqual(readFileSync(join(dist, path)), bytes);
    assert.deepEqual(readFileSync(join(output, 'upload', path)), bytes);
  }
  for (const item of result.files) {
    assert.equal(item.sha256, createHash('sha256').update(readFileSync(join(output, 'upload', item.path))).digest('hex'));
    assert.equal(lstatSync(join(output, 'upload', item.path)).mtime.toISOString(), '2000-01-01T00:00:00.000Z');
  }
  const evidence = readFileSync(join(output, 'manifest.json'), 'utf8');
  assert.ok(!evidence.includes(dist));
  assert.ok(!evidence.includes('process.env'));
}));

test('headers block forms, connections, indexing and embedding without blocking local UI assets', () => {
  for (const value of ["form-action 'none'", "connect-src 'none'", "frame-ancestors 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "font-src 'self'", 'noindex, nofollow, noarchive', 'nosniff', 'Referrer-Policy: no-referrer']) assert.ok(reviewHeaders.includes(value));
  assert.ok(!reviewHeaders.includes("script-src 'self' 'unsafe-inline'"));
});

test('fixture, integration and public content cannot become an owner review package', () => {
  for (const change of [
    source => source.replace('data-enquiry-form="true"', 'data-enquiry-active-form="true" method="post" action="/api/enquiries"'),
    source => source.replace('Photograph to add', 'Synthetic test image'),
    source => source.replace('Website draft.', 'Approved public website'),
    source => source.replace('noindex, nofollow', 'index, follow'),
  ]) fixture(({ build, edit }) => { edit('index.html', change); assert.throws(() => build(), /Review package refused/); });
  fixture(({ root, build }) => { assert.throws(() => build({ sourceDirectory: join(root, 'dist-fixture') }), /separate/); });
});

test('named fields, form destinations and enabled submit controls are rejected', () => {
  for (const change of [
    source => source.replace('<form ', '<form action="https://outside.invalid/send" '),
    source => source.replace('id="enquiry-name"', 'id="enquiry-name" name="name"'),
    source => source.replace('type="button" disabled', 'type="submit"'),
    source => source.replace('type="button" disabled', 'type="button"'),
    source => source.replace('id="enquiry-name"', 'id="enquiry-name" formaction="/send"'),
    source => source.replace('<form ', '<form data-netlify="true" '),
  ]) fixture(({ edit, build }) => { edit('index.html', change); assert.throws(() => build(), /Review package refused/); });
});

test('inline scripts, network modules, remote assets and real media are rejected', () => {
  for (const change of [
    source => source.replace('<script type="module"', '<script onload="send()" type="module"'),
    source => source.replace('</script>', 'window.location="https://outside.invalid";</script>'),
    source => source.replace(`src="${module}"`, 'src="https://outside.invalid/review.js"'),
    source => source.replace('</body>', '<img src="/media/photograph.jpg"></body>'),
    source => source.replace('</body>', '<picture></picture></body>'),
    source => source.replace('</body>', '<iframe src="/index.html"></iframe></body>'),
    source => source.replace('</body>', '<div style="background-image:url(data:image/png;base64,AAAA)"></div></body>'),
    source => source.replace('</body>', '<style>body{background-image:url(https://outside.invalid/photo.jpg)}</style></body>'),
    source => source.replace('</body>', '<div style="background-image:&#117;rl(https://outside.invalid/photo.jpg)"></div></body>'),
    source => source.replace('</body>', '<div style="background-image:u\\72l(https://outside.invalid/photo.jpg)"></div></body>'),
  ]) fixture(({ edit, build }) => { edit('index.html', change); assert.throws(() => build(), /Review package refused/); });
  fixture(({ edit, build }) => { edit('_astro/review.12345678.js', () => 'fetch("/send");'); assert.throws(() => build(), /network/); });
  fixture(({ edit, build }) => { edit('_astro/review.12345678.css', source => `${source}body{background:url(https://outside.invalid/photo.jpg)}`); assert.throws(() => build(), /nonlocal/); });
});

test('the package rejects extra functions, sources, maps, archives and private directories', () => {
  for (const path of ['.env', 'netlify/functions/enquiry.js', '_astro/source.js.map', 'media/photo.jpg', 'server/private.ts', 'originals.zip', '.local/database']) {
    fixture(({ dist, build }) => { mkdirSync(dirname(join(dist, path)), { recursive: true }); writeFileSync(join(dist, path), 'test'); assert.throws(() => build(), /unexpected/); });
  }
});

test('secret and private source checks never include the matched value in diagnostics', () => {
  for (const secret of ['gh' + 'p_' + 'x'.repeat(40), ['https://', 'example-user:', 'synthetic-only', '@private.invalid'].join(''), '/Users/test/private/notes']) {
    fixture(({ edit, build }) => {
      edit('_astro/review.12345678.js', source => `${source}\n// ${secret}`);
      assert.throws(() => build(), error => { assert.ok(!error.message.includes(secret)); return /credential or private source/.test(error.message); });
    });
  }
  fixture(({ dist, build }) => {
    writeFileSync(join(dist, '_astro/source-sans-3-latin-wght-normal.12345678.woff2'), Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(4), Buffer.from('gh' + 'p_' + 'x'.repeat(40))]));
    assert.throws(() => build(), /credential or private source/);
  });
});

test('source file and directory symlinks cannot reach outside the artifact', () => {
  for (const target of ['favicon.svg', '_astro']) fixture(({ root, dist, build }) => {
    const outside = join(root, 'outside');
    mkdirSync(outside);
    writeFileSync(join(outside, 'private.txt'), 'private source');
    rmSync(join(dist, target), { recursive: true, force: true });
    symlinkSync(target === '_astro' ? outside : join(outside, 'private.txt'), join(dist, target));
    assert.throws(() => build(), /symbolic links/);
  });
});

test('output overlap and output symlinks are rejected without deleting their targets', () => fixture(({ root, dist, output, build }) => {
  assert.throws(() => build({ packageDirectory: join(dist, '.review-package') }), /separate/);
  const protectedFolder = join(root, 'protected');
  mkdirSync(protectedFolder);
  writeFileSync(join(protectedFolder, 'keep.txt'), 'keep');
  symlinkSync(protectedFolder, output);
  assert.throws(() => build(), /unsafe package directory/);
  assert.equal(readFileSync(join(protectedFolder, 'keep.txt'), 'utf8'), 'keep');
}));

test('a rejected rebuild removes stale package output and preserves dist', () => fixture(({ dist, output, edit, build }) => {
  build();
  assert.ok(existsSync(join(output, 'upload/index.html')));
  edit('index.html', source => source.replace('noindex, nofollow', 'index, follow'));
  assert.throws(() => build(), /indexing/);
  assert.equal(existsSync(output), false);
  assert.ok(existsSync(join(dist, 'index.html')));
}));

test('early CLI mode rejection removes stale generated output without touching source files', () => fixture(({ root, dist, output, build }) => {
  build();
  const scriptDirectory = join(root, 'scripts');
  mkdirSync(scriptDirectory);
  const copy = join(scriptDirectory, 'package-review.mjs');
  writeFileSync(copy, readFileSync(new URL('../scripts/package-review.mjs', import.meta.url)));
  const result = spawnSync(process.execPath, [copy], { env: { PATH: process.env.PATH, PUBLIC_SITE_MODE: 'fixture' }, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ordinary local review environment/);
  assert.equal(existsSync(output), false);
  assert.ok(existsSync(join(dist, 'index.html')));
}));

test('missing files, broken local links and an incomplete checklist fail verification', () => {
  fixture(({ dist }) => { rmSync(join(dist, 'content-checklist/index.html')); assert.throws(() => verifyReviewDist(dist), /required review file/); });
  fixture(({ edit, build }) => { edit('index.html', source => source.replace('</body>', '<a href="/missing/">Missing page</a></body>')); assert.throws(() => build(), /missing local destination/); });
  fixture(({ edit, build }) => { edit('index.html', source => source.replace('</body>', '<a href="/content-checklist/#missing">Missing item</a></body>')); assert.throws(() => build(), /missing local fragment/); });
  fixture(({ edit, build }) => { edit('content-checklist/index.html', source => source.replace('data-slot-item', 'data-removed')); assert.throws(() => build(), /27 content groups/); });
});

test('ZIP includes only upload files and is unchanged when the external source stamp changes', () => fixture(({ output, build }) => {
  if (!existsSync('/usr/bin/zip')) { assert.throws(() => build({ zip: true }), /system zip is unavailable/); return; }
  const first = build({ zip: true });
  const zip = readFileSync(join(output, 'owner-review.zip'));
  const names = [];
  // Read central-directory names without relying on an unzip executable.
  for (let offset = 0; offset + 46 <= zip.length; offset++) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) continue;
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    names.push(zip.toString('utf8', offset + 46, offset + 46 + nameLength));
    offset += 45 + nameLength + extraLength + commentLength;
  }
  assert.deepEqual(names, first.files.map(file => file.path));
  assert.ok(!names.includes('manifest.json'));
  assert.ok(!names.some(name => name.startsWith('upload/')));
  let second;
  const priorUmask = process.umask(0o077);
  try { second = build({ zip: true, metadata: { ...metadata, createdAt: '2026-10-16T10:00:00.000Z', sourceTree: 'modified' } }); }
  finally { process.umask(priorUmask); }
  assert.equal(first.archive.sha256, second.archive.sha256);
  assert.equal(first.uploadArtifactSha256, second.uploadArtifactSha256);
  assert.equal(second.sourceTree, 'modified');
}));
