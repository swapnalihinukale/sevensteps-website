import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, symlinkSync, realpathSync, mkdirSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { verifyPublicAssets } from '../src/lib/public-assets.ts';
import type { Photograph } from '../src/lib/media.ts';

function setup() {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'seven-steps-public-assets-')));
  const body = Buffer.from('synthetic file bytes');
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 20);
  const filename = `checked-photo-${hash}-800.jpg`;
  const image = { src: `/media/${filename}`, width: 800, height: 600, bytes: body.length };
  mkdirSync(join(directory, 'media'));
  writeFileSync(join(directory, 'media', filename), body);
  const photo: Photograph = { id: 'checked-photo', alt: 'Geometric test image.', width: 800, height: 600, focalPoint: { x: .5, y: .5 }, sources: { avif: [image], webp: [image], jpeg: [image] }, full: image };
  return { directory, filename, photos: { 'checked-photo': photo }, clean: () => rmSync(directory, { recursive: true, force: true }) };
}
test('generated media verification accepts matching bytes and no unrelated assets', () => {
  const sample = setup();
  try { assert.doesNotThrow(() => verifyPublicAssets(sample.photos, sample.directory)); } finally { sample.clean(); }
});
test('same-length tampering, extra files and symbolic links fail verification', () => {
  for (const tamper of ['bytes', 'extra', 'symlink']) {
    const sample = setup();
    try {
      if (tamper === 'bytes') writeFileSync(join(sample.directory, 'media', sample.filename), Buffer.from('different file bytes'));
      else if (tamper === 'extra') writeFileSync(join(sample.directory, 'media', 'private-note.txt'), 'Private material');
      else { rmSync(join(sample.directory, 'media', sample.filename)); symlinkSync('/etc/hosts', join(sample.directory, 'media', sample.filename)); }
      assert.throws(() => verifyPublicAssets(sample.photos, sample.directory), /unsafe/);
    } finally { sample.clean(); }
  }
});


test('known base assets pass only when copied unchanged from approved sources', () => {
  const sample = setup();
  try {
    cpSync('public/favicon.svg', join(sample.directory, 'favicon.svg'));
    cpSync('public/licenses', join(sample.directory, 'licenses'), { recursive: true });
    assert.doesNotThrow(() => verifyPublicAssets(sample.photos, sample.directory));
  } finally { sample.clean(); }
});
test('stray siblings, altered favicon, extra licence and symlink directories fail', () => {
  for (const tamper of ['sibling', 'favicon', 'licence', 'directory']) {
    const sample = setup();
    try {
      if (tamper === 'sibling') writeFileSync(join(sample.directory, 'private.txt'), 'Private material');
      else if (tamper === 'favicon') writeFileSync(join(sample.directory, 'favicon.svg'), '<svg><script>bad()</script></svg>');
      else if (tamper === 'licence') { cpSync('public/licenses', join(sample.directory, 'licenses'), { recursive: true }); writeFileSync(join(sample.directory, 'licenses', 'private.txt'), 'Private material'); }
      else symlinkSync(join(process.cwd(), 'public/licenses'), join(sample.directory, 'licenses'));
      assert.throws(() => verifyPublicAssets(sample.photos, sample.directory), /unsafe/);
    } finally { sample.clean(); }
  }
});
