import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMediaFixtures } from './media-fixtures.mjs';
import { compilePhotographs } from './media-pipeline.mjs';

const directory = path => fileURLToPath(new URL(path, import.meta.url));
const sourceRoot = directory('../.generated/fixture-masters/');
const outputRoot = directory('../.generated/fixture-public/media/');
const manifest = directory('../.generated/media-fixture.json');
await rm(manifest, { force: true });
await rm(outputRoot, { recursive: true, force: true });
try {
  const inputs = await createMediaFixtures(sourceRoot);
  const records = await compilePhotographs(inputs, { sourceRoot, outputRoot, mode: 'fixture' });
  await mkdir(directory('../.generated/'), { recursive: true });
  await writeFile(manifest, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Prepared ${Object.keys(records).length} synthetic media fixtures. No portfolio work or public clearance is implied.`);
} catch (error) {
  await rm(outputRoot, { recursive: true, force: true });
  await rm(manifest, { force: true });
  console.error(error.message);
  process.exitCode = 1;
}
