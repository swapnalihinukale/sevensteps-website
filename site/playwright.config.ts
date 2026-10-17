import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync, mkdirSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Firefox 157's native app-data discovery fails on this macOS 27 host.
// Use isolated test-only directories, leaving existing browser profiles alone.
// Keep credentials out of serialised Playwright reports.
const firefoxEnv: Record<string, string> = {};
for (const key of ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'DISPLAY', 'SYSTEMROOT']) {
  if (process.env[key]) firefoxEnv[key] = process.env[key];
}
if (process.platform === 'darwin') {
  const scratch = mkdtempSync(join(realpathSync(tmpdir()), 'seven-steps-firefox-'));
  const local = join(scratch, 'local');
  mkdirSync(local, { mode: 0o700 });
  firefoxEnv.MOZ_APP_DATA = scratch;
  firefoxEnv.MOZ_LOCAL_APP_DATA = local;
  process.once('exit', () => rmSync(scratch, { recursive: true, force: true }));
}
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 3,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', workers: 1, use: { ...devices['Desktop Firefox'], launchOptions: { env: firefoxEnv } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    // Keep Astro in the foreground even when an assistant starts Playwright.
    { command: 'npm run preview -- --ignore-lock', url: 'http://127.0.0.1:4321', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run lab', url: 'http://127.0.0.1:4322', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run lab:site', url: 'http://127.0.0.1:4323', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run preview:fixture', url: 'http://127.0.0.1:4324', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run preview:review-package', url: 'http://127.0.0.1:4325', reuseExistingServer: false, timeout: 60000 },
  ],
});
