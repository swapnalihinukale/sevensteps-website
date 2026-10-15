import { spawnSync } from 'node:child_process';
import { rmSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const mode = process.argv[2] ?? 'review';
if (process.argv.length > 3 || !['review', 'public', 'fixture', 'integration'].includes(mode)) throw new Error('Use review, public, fixture or integration mode.');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
process.chdir(root);
const output = mode === 'fixture' ? 'dist-fixture' : mode === 'integration' ? 'dist-integration' : 'dist';
// Prevent a rejected public build from leaving a previous review artifact to deploy.
rmSync(join(root, output), { recursive: true, force: true });
const env = { ...process.env, PUBLIC_SITE_MODE: mode === 'integration' ? 'review' : mode };
delete env.ENQUIRY_LOCAL_LAB;
if (mode === 'integration') env.ENQUIRY_LOCAL_LAB = '1';
function run(args) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) {
    rmSync(join(root, output), { recursive: true, force: true });
    process.exit(result.status ?? 1);
  }
}
if (mode === 'public' || mode === 'fixture') {
  if (mode === 'public') run(['scripts/content-check.mjs', 'public']);
  const assets = mode === 'fixture' ? '.generated/fixture-public' : '.generated/public-assets';
  rmSync(join(root, assets), { recursive: true, force: true });
  run([`scripts/prepare-media-${mode === 'fixture' ? 'fixtures' : 'public'}.mjs`]);
  run(['scripts/public-check.mjs', mode]);
  cpSync('public/favicon.svg', join(assets, 'favicon.svg'));
  cpSync('public/licenses', join(assets, 'licenses'), { recursive: true });
} else {
  run(['scripts/content-check.mjs', 'review']);
}
run(['node_modules/astro/bin/astro.mjs', 'build']);
run(['scripts/copy-check.mjs', output]);
run(['scripts/links-check.mjs', output]);
if (mode === 'public' || mode === 'fixture') run(['scripts/check-public-artifact.mjs', mode]);
