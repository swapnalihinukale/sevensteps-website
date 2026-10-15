import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import type { Photograph } from './media.ts';

/** Direct Astro builds must verify the prepared image bytes as well as the JSON records. */
export function verifyPublicAssets(photos: Record<string, Photograph>, directory: string, baseDirectory = resolve(process.cwd(), 'public')): void {
  const publicRoot = resolve(directory);
  const root = resolve(publicRoot, 'media');
  try {
    const directorySafe = (path: string) => { if (realpathSync(path) !== path || !lstatSync(path).isDirectory() || lstatSync(path).isSymbolicLink()) throw new Error('directory'); };
    directorySafe(publicRoot);
    directorySafe(root);
    const approvedFiles = new Set(['favicon.svg', 'licenses/source-sans-3-OFL.txt', 'licenses/source-serif-4-OFL.txt']);
    const verifyBaseFile = (relative: string) => {
      const path = resolve(publicRoot, relative);
      const original = resolve(baseDirectory, relative);
      if (!approvedFiles.has(relative) || !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink() || !lstatSync(original).isFile() || lstatSync(original).isSymbolicLink() || !readFileSync(path).equals(readFileSync(original))) throw new Error('base file');
    };
    for (const name of readdirSync(publicRoot)) {
      if (name === 'media') continue;
      if (name === 'favicon.svg') verifyBaseFile(name);
      else if (name === 'licenses') {
        const path = resolve(publicRoot, name);
        directorySafe(path);
        const names = readdirSync(path);
        if (names.length !== 2) throw new Error('licenses');
        for (const filename of names) verifyBaseFile(`licenses/${filename}`);
      } else throw new Error('unapproved public file');
    }
    const checked = new Set<string>();
    for (const photo of Object.values(photos)) {
      for (const image of [...photo.sources.avif, ...photo.sources.webp, ...photo.sources.jpeg, photo.full]) {
        const filename = basename(image.src);
        if (checked.has(filename)) continue;
        const expected = new RegExp(`^${photo.id}-([a-f0-9]{20})-${image.width}\\.(?:avif|webp|jpg)$`, 'u').exec(filename);
        if (!expected || image.src !== `/media/${filename}`) throw new Error('name');
        const path = resolve(root, filename);
        const stat = lstatSync(path);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== image.bytes) throw new Error('file');
        const digest = createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 20);
        if (digest !== expected[1]) throw new Error('digest');
        checked.add(filename);
      }
    }
    if (readdirSync(root).some(name => !checked.has(name))) throw new Error('unused');
  } catch { throw new Error('Public assets are missing, changed, unreferenced or unsafe. Prepare the selected media again.'); }
}
