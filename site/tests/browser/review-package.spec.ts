import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:4325';
test.use({ baseURL: origin });

test('owner review headers preserve mobile navigation, gallery keys and checklist filtering', async ({ page }) => {
  const faults: string[] = [];
  const outside: string[] = [];
  page.on('pageerror', error => faults.push(error.message));
  page.on('console', message => { if (message.type() === 'error') faults.push(message.text()); });
  page.on('request', request => { if (!request.url().startsWith(origin + '/')) outside.push(request.url()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.locator('#mobile-menu').getByRole('link', { name: 'The work' }).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.getByRole('heading', { name: 'Wedding story', exact: true }).click();
  const opener = page.locator('[data-viewer-trigger="0"]');
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-viewer-close]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-viewer-position]')).toHaveText('2 / 6');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.locator('[data-content-note="STORY-A-DETAILS-01"] a').click();
  await page.locator('#slot-search').fill('CONTACT-01');
  await expect(page.locator('[data-slot-item]:visible')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(faults).toEqual([]);
  expect(outside).toEqual([]);
});

test('owner review typing never submits or exposes typed data in the URL', async ({ page }) => {
  const submissions: string[] = [];
  page.on('request', request => { if (request.method() !== 'GET' || request.url().includes('/api/')) submissions.push(request.url()); });
  await page.goto('/#enquire');
  const before = page.url();
  await page.getByLabel('Your name', { exact: true }).fill('Synthetic Review');
  await page.getByLabel('Email address', { exact: true }).fill('synthetic@example.test');
  await page.getByLabel('Email address', { exact: true }).press('Enter');
  await expect(page.locator('[data-enquiry-form] button')).toBeDisabled();
  expect(page.url()).toBe(before);
  expect(submissions).toEqual([]);
});

test('review server denies writes and source access and applies restrictive headers to deep links and 404s', async ({ request }) => {
  for (const path of ['/', '/stories/couple-session/', '/content-checklist/', '/missing-review-page']) {
    const response = await request.get(path);
    expect(response.status()).toBe(path === '/missing-review-page' ? 404 : 200);
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive');
    expect(response.headers()['cache-control']).toBe('no-store');
    expect(response.headers()['content-security-policy']).toContain("form-action 'none'");
    expect(response.headers()['content-security-policy']).toContain("connect-src 'none'");
  }
  for (const path of ['/manifest.json', '/.env', '/package.json', '/api/enquiries', '/%2e%2e/package.json']) {
    expect((await request.get(path)).status()).toBe(404);
  }
  expect((await request.post('/')).status()).toBe(405);
  expect((await request.get('/', { headers: { host: 'untrusted.example' } })).status()).toBe(403);
});
