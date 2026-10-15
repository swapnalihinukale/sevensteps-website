import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
const mode = process.argv[2] ?? 'review';
if (!['review', 'public'].includes(mode)) throw new Error('Use review or public mode.');
// Prevent a rejected public build from leaving a previous review artifact to deploy.
rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true });
const env = { ...process.env, PUBLIC_SITE_MODE: mode };
for (const args of [['scripts/content-check.mjs'], ['node_modules/astro/bin/astro.mjs', 'build']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
for (const script of ['scripts/copy-check.mjs', 'scripts/links-check.mjs']) {
  const result = spawnSync(process.execPath, [script], { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
