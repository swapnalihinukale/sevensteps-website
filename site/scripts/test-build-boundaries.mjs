import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const env = { ...process.env };
delete env.PUBLIC_SITE_MODE;
delete env.ENQUIRY_LOCAL_LAB;
delete env.NETLIFY;
delete env.CONTEXT;
function refused(args, extra, message) {
  const result = spawnSync(process.execPath, args, { env: { ...env, ...extra }, encoding: 'utf8', timeout: 30_000 });
  assert.ok(result.status !== null && result.status !== 0, message);
  // Do not serialise environment or arbitrary child output in evidence.
  console.log(`PASS: ${message}`);
}
refused(['scripts/build.mjs', 'public'], {}, 'actual public build refuses unresolved content');
assert.equal(existsSync('dist'), false, 'a rejected public build must remove the prior artifact');
refused(['node_modules/astro/bin/astro.mjs', 'build'], { PUBLIC_SITE_MODE: 'public' }, 'direct Astro cannot bypass real-content gates');
refused(['node_modules/astro/bin/astro.mjs', 'build'], { PUBLIC_SITE_MODE: 'fixture', CONTEXT: 'production' }, 'hosted builds cannot select synthetic content');
refused(['node_modules/astro/bin/astro.mjs', 'build'], { PUBLIC_SITE_MODE: 'review', ENQUIRY_LOCAL_LAB: '1', NETLIFY: 'true' }, 'hosted builds cannot activate local enquiry mode');
refused(['node_modules/astro/bin/astro.mjs', 'build'], { PUBLIC_SITE_MODE: 'review', ENQUIRY_LOCAL_LAB: 'unexpected' }, 'unknown enquiry modes are rejected');
const restored = spawnSync(process.execPath, ['scripts/build.mjs', 'review'], { env, stdio: 'inherit' });
assert.equal(restored.status, 0, 'restore the ordinary non-sending review build');
console.log('PASS: build boundaries checked and review artifact restored.');
