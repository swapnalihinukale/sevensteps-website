import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compilePhotographs } from './media-pipeline.mjs';

const directory = path => fileURLToPath(new URL(path, import.meta.url));
const inputFile = directory('../content/media.json');
const sourceRoot = directory('../.local/media-masters/');
const outputRoot = directory('../.generated/public-assets/media/');
const manifest = directory('../.generated/media-public.json');
await rm(manifest, { force: true });
await rm(outputRoot, { recursive: true, force: true });
try {
  let inputs;
  try { inputs = JSON.parse(await readFile(inputFile, 'utf8')); }
  catch { throw new Error('Media preparation refused: add a valid content/media.json source list.'); }
  const records = await compilePhotographs(inputs, { sourceRoot, outputRoot, mode: 'public' });
  await writeFile(manifest, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Prepared ${Object.keys(records).length} permitted image records. Check crops and photographic quality before release.`);
} catch (error) {
  await rm(outputRoot, { recursive: true, force: true });
  await rm(manifest, { force: true });
  console.error(error.message);
  process.exitCode = 1;
}
