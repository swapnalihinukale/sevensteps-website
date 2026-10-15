import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import sharp from 'sharp';
import { compilePhotographs, MEDIA_LIMITS, validateMediaInputs } from '../scripts/media-pipeline.mjs';
import { createMediaFixtures } from '../scripts/media-fixtures.mjs';

let directory, sourceRoot, outputRoot, inputs, photographs;
const record = (source, values = {}) => ({ id: 'test-photo', source, alt: 'Synthetic geometric test image.', kind: 'synthetic', publicationCleared: false, ...values });
const compile = (records, extra = {}) => compilePhotographs(records, { sourceRoot, outputRoot: join(directory, 'other-output'), mode: 'fixture', ...extra });

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'sevensteps-media-test-'));
  sourceRoot = join(directory, 'masters');
  outputRoot = join(directory, 'derivatives');
  inputs = await createMediaFixtures(sourceRoot);
  photographs = await compilePhotographs(inputs, { sourceRoot, outputRoot, mode: 'fixture' });
});
after(async () => { await rm(directory, { recursive: true, force: true }); });

test('encodes responsive AVIF, WebP and JPEG derivatives with actual dimensions', async () => {
  assert.equal(Object.keys(photographs).length, 3);
  const photo = photographs['fixture-wide'];
  assert.deepEqual(photo.sources.avif.map(image => image.width), [480, 960, 1440, 1920]);
  for (const [format, variants] of Object.entries(photo.sources)) {
    for (const variant of variants) {
      const buffer = await readFile(join(outputRoot, basename(variant.src)));
      const decoded = await sharp(buffer).metadata();
      assert.equal(decoded.format, format === 'avif' ? 'heif' : format);
      assert.equal(decoded.width, variant.width);
      assert.equal(decoded.height, variant.height);
      assert.equal(buffer.length, variant.bytes);
      assert.equal(variant.width / variant.height, photo.width / photo.height);
    }
  }
});

test('keeps small masters at native size and serves a bounded full frame', async () => {
  const square = photographs['fixture-square'];
  assert.deepEqual(square.sources.jpeg.map(image => image.width), [480, 900]);
  assert.equal(square.full.width, 900);
  assert.equal(photographs['fixture-wide'].full.width, 2400);
  await sharp({ create: { width: 3000, height: 100, channels: 3, background: '#405B4B' } }).png().toFile(join(sourceRoot, 'long.png'));
  const bounded = (await compile([record('long.png')]))['test-photo'];
  assert.equal(bounded.full.width, MEDIA_LIMITS.fullEdge);
  await sharp({ create: { width: 100, height: 12000, channels: 3, background: '#405B4B' } }).png().toFile(join(sourceRoot, 'tall-limit.png'));
  const tall = (await compile([record('tall-limit.png')]))['test-photo'];
  assert.ok(tall.full.height <= MEDIA_LIMITS.fullEdge);
  assert.ok(tall.full.width <= MEDIA_LIMITS.fullEdge);
  assert.ok(tall.sources.jpeg.every(image => image.height <= MEDIA_LIMITS.derivativeHeight && image.width <= 100));
  assert.equal(tall.sources.jpeg.length, 1);
});

test('normalizes EXIF orientation and strips private EXIF, XMP and ICC metadata', async () => {
  const source = join(sourceRoot, 'oriented.jpg');
  await sharp({ create: { width: 120, height: 80, channels: 3, background: '#722F46' } })
    .withMetadata({ orientation: 6 })
    .withExifMerge({ IFD0: { Artist: 'PRIVATE SOURCE ARTIST', Copyright: 'PRIVATE RIGHTS RECORD' } })
    .withXmp('<x:xmpmeta xmlns:x="adobe:ns:meta/"><private>PRIVATE SOURCE NOTE</private></x:xmpmeta>')
    .jpeg().toFile(source);
  const sourceMetadata = await sharp(source).metadata();
  assert.equal(sourceMetadata.orientation, 6);
  assert.ok(sourceMetadata.exif);
  assert.ok(sourceMetadata.xmp);
  assert.ok(sourceMetadata.icc);
  const result = (await compile([record('oriented.jpg', { caption: 'Approved public description.', credit: 'Approved credit' })]))['test-photo'];
  assert.equal(result.width, 80);
  assert.equal(result.height, 120);
  for (const format of ['avif', 'webp', 'jpeg']) {
    const variant = result.sources[format][0];
    const output = await readFile(join(directory, 'other-output', basename(variant.src)));
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.width, 80);
    assert.equal(metadata.height, 120);
    assert.equal(metadata.orientation, undefined);
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.xmp, undefined);
    assert.equal(metadata.iptc, undefined);
    assert.equal(metadata.icc, undefined);
    assert.ok(!output.includes(Buffer.from('PRIVATE')));
  }
  const manifest = JSON.stringify(result);
  assert.ok(!manifest.includes(sourceRoot));
  for (const privateKey of ['source', 'publicationCleared', 'kind']) assert.ok(!Object.hasOwn(result, privateKey));
});

test('flattens transparent raster pixels against the page paper colour', async () => {
  await sharp({ create: { width: 24, height: 24, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(join(sourceRoot, 'alpha.png'));
  const image = (await compile([record('alpha.png')]))['test-photo'].full;
  const pixels = await sharp(join(directory, 'other-output', basename(image.src))).raw().toBuffer();
  assert.ok(Math.abs(pixels[0] - 250) <= 3);
  assert.ok(Math.abs(pixels[1] - 250) <= 3);
  assert.ok(Math.abs(pixels[2] - 248) <= 3);
});

test('converts a tagged Display P3 input to sRGB pixels before discarding the profile', async () => {
  const source = join(sourceRoot, 'colour.png');
  await sharp({ create: { width: 24, height: 24, channels: 3, background: { r: 200, g: 80, b: 40 } } }).withIccProfile('p3').png().toFile(source);
  assert.ok((await sharp(source).metadata()).icc);
  const image = (await compile([record('colour.png')]))['test-photo'].full;
  const { data, info } = await sharp(join(directory, 'other-output', basename(image.src))).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 3);
  assert.ok(Math.abs(data[0] - 200) <= 8);
  assert.ok(Math.abs(data[1] - 80) <= 8);
  assert.ok(Math.abs(data[2] - 40) <= 8);
});

test('repeat compilation has stable URLs and refuses an output content collision', async () => {
  const second = await compilePhotographs(inputs, { sourceRoot, outputRoot, mode: 'fixture' });
  assert.deepEqual(second, photographs);
  const destination = join(outputRoot, basename(photographs['fixture-square'].sources.avif[0].src));
  await writeFile(destination, 'tampered output');
  await assert.rejects(compilePhotographs(inputs, { sourceRoot, outputRoot, mode: 'fixture' }), /derivative could not be written/);
});

test('source identity, focal points and public copy are validated before decoding', () => {
  assert.throws(() => validateMediaInputs([inputs[0], inputs[0]], 'fixture'), /duplicate image id/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { id: '../secret' })], 'fixture'), /image id/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { focalPoint: { x: 2, y: 0.5 } })], 'fixture'), /focal point/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { alt: '' })], 'fixture'), /description/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { caption: String.fromCharCode(0x2014) })], 'fixture'), /description/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { privateNote: 'do not export' })], 'fixture'), /record/);
  assert.throws(() => validateMediaInputs(Array.from({ length: 81 }, () => inputs[0]), 'fixture'), /record count/);
  assert.throws(() => validateMediaInputs([], 'anything'), /build mode/);
});

test('synthetic assets and uncleared photographs cannot enter public preparation', () => {
  assert.throws(() => validateMediaInputs([inputs[0]], 'public'), /no clearance/);
  assert.throws(() => validateMediaInputs([record('wide.jpg', { kind: 'photograph' })], 'public'), /no clearance/);
  const permitted = record('wide.jpg', { kind: 'photograph', publicationCleared: true });
  assert.equal(validateMediaInputs([permitted], 'public').length, 1);
  assert.throws(() => validateMediaInputs([permitted], 'fixture'), /synthetic images/);
});

test('remote URLs, absolute paths, traversal and unsupported extensions are rejected', async () => {
  for (const source of ['https://example.com/image.jpg', '/tmp/image.jpg', '../image.jpg', 'nested/../wide.jpg', 'nested//wide.jpg', 'nested\\image.jpg', 'image.svg', 'image.gif', 'image.jpeg?x=1']) {
    await assert.rejects(compile([record(source)]), /invalid source reference/);
  }
});

test('symlinks cannot read an image outside the fixed source root', async () => {
  const outside = join(directory, 'outside.jpg');
  await writeFile(outside, await readFile(join(sourceRoot, 'wide.jpg')));
  await symlink(outside, join(sourceRoot, 'outside-link.jpg'));
  await assert.rejects(compile([record('outside-link.jpg')]), /source link leaves/);
});

test('source and output directories cannot overlap through direct or symlinked paths', async () => {
  await assert.rejects(compile([inputs[0]], { outputRoot: sourceRoot }), /overlap/);
  await assert.rejects(compile([inputs[0]], { outputRoot: join(sourceRoot, 'output') }), /overlap/);
  const alias = join(directory, 'master-alias');
  await symlink(sourceRoot, alias);
  await assert.rejects(compile([inputs[0]], { outputRoot: alias }), /overlap/);
});

test('missing, empty and corrupt files fail with a bounded diagnostic', async () => {
  await assert.rejects(compile([record('missing.jpg')]), /source is missing/);
  await writeFile(join(sourceRoot, 'empty.jpg'), '');
  await assert.rejects(compile([record('empty.jpg')]), /byte limit/);
  await writeFile(join(sourceRoot, 'corrupt.jpg'), 'not an image');
  await assert.rejects(compile([record('corrupt.jpg')]), /cannot be decoded/);
  await mkdir(join(sourceRoot, 'directory.jpg'));
  await assert.rejects(compile([record('directory.jpg')]), /byte limit/);
});

test('overlarge byte and dimension inputs fail before conversion', async () => {
  const oversized = join(sourceRoot, 'oversized.jpg');
  await writeFile(oversized, '');
  await truncate(oversized, MEDIA_LIMITS.sourceBytes + 1);
  await assert.rejects(compile([record('oversized.jpg')]), /byte limit/);
  await sharp({ create: { width: MEDIA_LIMITS.edge + 1, height: 1, channels: 3, background: '#405B4B' } }).png().toFile(join(sourceRoot, 'wide-limit.png'));
  await assert.rejects(compile([record('wide-limit.png')]), /dimension limit/);
});

test('pixel limits reject a malicious PNG header before allocating its declared image', async () => {
  const input = await readFile(join(sourceRoot, 'square.png'));
  input.writeUInt32BE(10000, 16);
  input.writeUInt32BE(10000, 20);
  let checksum = 0xffffffff;
  for (const byte of input.subarray(12, 29)) {
    checksum ^= byte;
    for (let bit = 0; bit < 8; bit++) checksum = (checksum >>> 1) ^ ((checksum & 1) ? 0xedb88320 : 0);
  }
  input.writeUInt32BE((checksum ^ 0xffffffff) >>> 0, 29);
  await writeFile(join(sourceRoot, 'pixel-limit.png'), input);
  await assert.rejects(compile([record('pixel-limit.png')]), /cannot be decoded within limits/);
});

test('an unsupported raster cannot bypass the input format gate by changing its extension', async () => {
  await sharp({ create: { width: 20, height: 20, channels: 3, background: '#722F46' } }).gif().toFile(join(sourceRoot, 'disguised.png'));
  await assert.rejects(compile([record('disguised.png')]), /unsupported raster/);
});

test('animated WebP inputs fail instead of silently publishing one frame', async () => {
  const pixels = Buffer.alloc(40 * 80 * 3);
  pixels.fill(255, 0, 40 * 40 * 3);
  const source = join(sourceRoot, 'animated.webp');
  await sharp(pixels, { raw: { width: 40, height: 80, channels: 3, pageHeight: 40 } }).webp({ loop: 0, delay: [100, 100] }).toFile(source);
  assert.equal((await sharp(source).metadata()).pages, 2);
  await assert.rejects(compile([record('animated.webp')]), /unsupported raster/);
});

test('the generated output contains derivatives and no original file or manifest', async () => {
  const names = await readdir(outputRoot);
  assert.ok(names.length > 3);
  assert.ok(names.every(name => /^fixture-[a-z]+-[0-9a-f]{20}-\d+\.(avif|webp|jpg)$/.test(name)));
  assert.ok(names.every(name => !['wide.jpg', 'tall.jpg', 'square.png'].includes(name)));
});
