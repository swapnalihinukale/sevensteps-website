import { defineConfig } from 'astro/config';
import { spawnSync } from 'node:child_process';

// Enforce the same boundary when Astro is invoked without the wrapper script.
if (process.env.PUBLIC_SITE_MODE === 'public') {
  const check = spawnSync(process.execPath, ['scripts/content-check.mjs'], { stdio: 'inherit', env: process.env });
  if (check.status !== 0) throw new Error('Public build refused: unresolved content or publication decisions.');
  throw new Error('Public delivery is not implemented yet. Complete the real media and receiving service release gates first.');
}

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
  vite: { build: { sourcemap: false } },
});
