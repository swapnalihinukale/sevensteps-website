import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkPublicArtifact } from '../scripts/check-public-artifact.mjs';

function artifact(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'sevensteps-public-artifact-'));
  const page = '<!doctype html><meta name="robots" content="noindex, nofollow"><p>Synthetic image test</p>';
  try {
    for (const file of ['index.html', '404.html', 'stories/a/index.html', 'stories/b/index.html']) {
      const path = join(root, file);
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, page);
    }
    writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    writeFileSync(join(root, 'sitemap.xml'), '<urlset />');
    run(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('isolated fixture output is accepted only as a fixture', () => artifact(root => {
  assert.deepEqual(checkPublicArtifact(root, 'fixture').failures, []);
  assert.ok(checkPublicArtifact(root, 'public').failures.some((value: string) => value.includes('Test content')));
}));
test('artifact boundary rejects review HTML, source maps and private source references', () => artifact(root => {
  writeFileSync(join(root, 'index.html'), '<a href="/content-checklist/">View checklist</a>');
  writeFileSync(join(root, 'bundle.js.map'), '{}');
  writeFileSync(join(root, 'bundle.js'), 'const source=".local/media-masters/photo.jpg";');
  const failures = checkPublicArtifact(root, 'fixture').failures;
  assert.ok(failures.some((value: string) => value.includes('Review content')));
  assert.ok(failures.some((value: string) => value.includes('source file')));
  assert.ok(failures.some((value: string) => value.includes('Private source reference')));
  assert.ok(failures.some((value: string) => value.includes('indexing')));
}));
