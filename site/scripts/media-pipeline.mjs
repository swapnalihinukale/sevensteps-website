import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

export const MEDIA_LIMITS = Object.freeze({
  sourceBytes: 20 * 1024 * 1024,
  batchBytes: 256 * 1024 * 1024,
  pixels: 48_000_000,
  edge: 12_000,
  records: 80,
  widths: Object.freeze([480, 960, 1440, 1920]),
  derivativeHeight: 3840,
  fullEdge: 2560,
});

const inputKeys = new Set(['id', 'source', 'alt', 'caption', 'credit', 'focalPoint', 'kind', 'publicationCleared']);
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const sourceFormats = new Set(['jpeg', 'png', 'webp', 'heif']);
const invalidText = /[\u0000-\u001f\u007f\u2014]/u;
const identifier = /^[a-z][a-z0-9-]{0,63}$/;

function fail(code) {
  // Fixed diagnostics keep private source paths and image metadata out of logs.
  throw new Error(`Media preparation refused: ${code}.`);
}

function text(value, maximum, optional = false) {
  if (optional && value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > maximum || invalidText.test(value)) fail('invalid public description');
  return value;
}

function beneath(root, path) {
  const child = relative(root, path);
  return child !== '' && child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child);
}

export function validateMediaInputs(records, mode) {
  if (!['review', 'public', 'fixture'].includes(mode)) fail('unknown build mode');
  if (!Array.isArray(records) || records.length > MEDIA_LIMITS.records) fail('invalid record count');
  const ids = new Set();
  return records.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record) || Object.keys(record).some(key => !inputKeys.has(key))) fail('invalid record');
    if (typeof record.id !== 'string' || !identifier.test(record.id) || ids.has(record.id)) fail('invalid or duplicate image id');
    ids.add(record.id);
    if (typeof record.source !== 'string' || record.source.length > 200 || !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(record.source) || record.source.split('/').some(part => !part || part === '.' || part === '..') || !sourceExtensions.has(extname(record.source).toLowerCase())) fail('invalid source reference');
    if (!['photograph', 'synthetic'].includes(record.kind) || typeof record.publicationCleared !== 'boolean') fail('missing source classification');
    if (mode === 'public' && (record.kind !== 'photograph' || !record.publicationCleared)) fail('public image has no clearance');
    if (mode === 'fixture' && record.kind !== 'synthetic') fail('fixture mode requires synthetic images');
    const focalPoint = record.focalPoint ?? { x: 0.5, y: 0.5 };
    if (!focalPoint || typeof focalPoint !== 'object' || Array.isArray(focalPoint) || Object.keys(focalPoint).some(key => !['x', 'y'].includes(key)) || !['x', 'y'].every(axis => Number.isFinite(focalPoint[axis]) && focalPoint[axis] >= 0 && focalPoint[axis] <= 1)) fail('invalid focal point');
    return {
      id: record.id,
      source: record.source,
      alt: text(record.alt, 600),
      caption: text(record.caption, 1000, true),
      credit: text(record.credit, 200, true),
      focalPoint: { x: focalPoint.x, y: focalPoint.y },
    };
  });
}

async function readMaster(root, record) {
  const candidate = resolve(root, record.source);
  if (!beneath(root, candidate)) fail('source leaves permitted directory');
  let file;
  try { file = await realpath(candidate); } catch { fail('source is missing'); }
  if (!beneath(root, file)) fail('source link leaves permitted directory');
  let details;
  try { details = await stat(file); } catch { fail('source cannot be read'); }
  if (!details.isFile() || details.size < 1 || details.size > MEDIA_LIMITS.sourceBytes) fail('source byte limit');
  let input;
  try { input = await readFile(file); } catch { fail('source cannot be read'); }
  if (input.length > MEDIA_LIMITS.sourceBytes) fail('source byte limit');
  let metadata;
  try { metadata = await sharp(input, { limitInputPixels: MEDIA_LIMITS.pixels, failOn: 'warning' }).metadata(); }
  catch { fail('source cannot be decoded within limits'); }
  if (!sourceFormats.has(metadata.format) || (metadata.format === 'heif' && metadata.compression !== 'av1') || (metadata.pages ?? 1) !== 1) fail('unsupported raster format');
  const { width, height } = metadata;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MEDIA_LIMITS.edge || height > MEDIA_LIMITS.edge || width * height > MEDIA_LIMITS.pixels) fail('source dimension limit');
  // EXIF orientations 5 to 8 swap the dimensions after automatic rotation.
  return { input, width: (metadata.orientation ?? 1) >= 5 ? height : width, height: (metadata.orientation ?? 1) >= 5 ? width : height };
}

async function derivative(input, width, heightLimit, format, id, outputRoot, urlPrefix) {
  try {
    let operation = sharp(input, { limitInputPixels: MEDIA_LIMITS.pixels, failOn: 'warning' })
      .rotate()
      .toColourspace('srgb')
      .flatten({ background: '#FAFAF8' })
      .resize({ width, height: heightLimit, fit: 'inside', withoutEnlargement: true });
    // Default output strips EXIF, IPTC, XMP and ICC. The pixels use sRGB.
    if (format === 'avif') operation = operation.avif({ quality: 55, effort: 4 });
    else if (format === 'webp') operation = operation.webp({ quality: 80, effort: 4 });
    else operation = operation.jpeg({ quality: 82, progressive: true, mozjpeg: false });
    const { data, info } = await operation.toBuffer({ resolveWithObject: true });
    const extension = format === 'jpeg' ? 'jpg' : format;
    const hash = createHash('sha256').update(data).digest('hex').slice(0, 20);
    const filename = `${id}-${hash}-${info.width}.${extension}`;
    const destination = resolve(outputRoot, filename);
    await writeFile(destination, data, { flag: 'wx' }).catch(async error => {
      // Identical content produces an identical, safe filename on a repeat build.
      if (error.code !== 'EEXIST') throw error;
      const existing = await lstat(destination);
      if (!existing.isFile() || existing.isSymbolicLink() || existing.size !== data.length || !(await readFile(destination)).equals(data)) throw new Error('Output collision');
    });
    return { src: `${urlPrefix}${filename}`, width: info.width, height: info.height, bytes: data.length };
  } catch { fail('derivative could not be written'); }
}

/** Compile local web masters. Callers own an empty generated output directory. */
export async function compilePhotographs(records, { sourceRoot, outputRoot, urlPrefix = '/media/', mode }) {
  const inputs = validateMediaInputs(records, mode);
  if (urlPrefix !== '/media/') fail('invalid derivative URL prefix');
  let root;
  try { root = await realpath(resolve(sourceRoot)); } catch { fail('source directory is missing'); }
  const output = resolve(outputRoot);
  if (output === root || beneath(root, output) || beneath(output, root)) fail('source and output directories overlap');
  await mkdir(output, { recursive: true });
  const outputReal = await realpath(output);
  if (outputReal === root || beneath(root, outputReal) || beneath(outputReal, root)) fail('source and output directories overlap');
  const result = {};
  let totalBytes = 0;
  for (const record of inputs) {
    const master = await readMaster(root, record);
    totalBytes += master.input.length;
    if (totalBytes > MEDIA_LIMITS.batchBytes) fail('batch byte limit');
    const maximumWidth = Math.max(1, Math.min(master.width, MEDIA_LIMITS.widths.at(-1), Math.floor(MEDIA_LIMITS.derivativeHeight * master.width / master.height)));
    const widths = [...new Set([...MEDIA_LIMITS.widths.filter(width => width <= maximumWidth), maximumWidth])].sort((a, b) => a - b);
    const sources = { avif: [], webp: [], jpeg: [] };
    // Encode sequentially to cap memory use on developer machines and CI runners.
    for (const format of Object.keys(sources)) {
      for (const width of widths) sources[format].push(await derivative(master.input, width, MEDIA_LIMITS.derivativeHeight, format, record.id, output, urlPrefix));
    }
    const fullWidth = Math.max(1, Math.min(master.width, MEDIA_LIMITS.fullEdge, Math.floor(MEDIA_LIMITS.fullEdge * master.width / master.height)));
    const full = sources.jpeg.find(image => image.width === fullWidth && image.height <= MEDIA_LIMITS.fullEdge) ?? await derivative(master.input, fullWidth, MEDIA_LIMITS.fullEdge, 'jpeg', record.id, output, urlPrefix);
    result[record.id] = {
      id: record.id, alt: record.alt,
      ...(record.caption ? { caption: record.caption } : {}),
      ...(record.credit ? { credit: record.credit } : {}),
      width: master.width, height: master.height,
      focalPoint: record.focalPoint,
      sources, full,
    };
  }
  return result;
}
