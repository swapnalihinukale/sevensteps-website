import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'http://127.0.0.1:4324';

test('fixture uses real responsive files with one lead image and no review content', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await expect(page.locator('img[loading="eager"]')).toHaveCount(1);
  const lead = page.locator('img[loading="eager"]');
  await expect.poll(() => lead.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(lead).toHaveAttribute('fetchpriority', 'high');
  await expect(lead).toHaveAttribute('srcset', /480w/);
  await expect(page.locator('[data-content-note], [data-slot-item]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://example.invalid/');
  expect((await request.get(`${origin}/content-checklist/`)).status()).toBe(404);
  expect((await request.get(`${origin}/sitemap.xml`)).status()).toBe(200);
  for (const width of [320, 390, 820, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('full-frame image loads only on opening, remains contained and restores focus', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => requested.push(new URL(request.url()).pathname));
  await page.goto(`${origin}/stories/wedding-story/`);
  const opener = page.locator('[data-viewer-trigger="0"]');
  const full = await opener.getAttribute('href');
  expect(full).toMatch(/^\/media\/.+\.jpg$/);
  expect(requested).not.toContain(full);
  await opener.click();
  const image = page.locator('[data-viewer-stage] img');
  await expect(image).toHaveAttribute('src', full!);
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(requested).toContain(full);
  await expect(image).toHaveCSS('object-fit', 'contain');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-viewer-position]')).toHaveText(/^2 \/ /);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(page.locator('[data-viewer-stage] img')).toHaveCount(0);
});

test('failed photographs have useful feedback and a full-view recovery path', async ({ page }) => {
  await page.route('**/media/**', route => route.abort());
  await page.goto(`${origin}/stories/wedding-story/`);
  const opener = page.locator('[data-viewer-trigger="0"]');
  await opener.scrollIntoViewIfNeeded();
  await expect(opener.locator('[data-photo-error]')).toBeVisible();
  await page.unroute('**/media/**');
  await opener.click();
  const image = page.locator('[data-viewer-stage] img');
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('[data-viewer-stage] [data-photo-error]')).toBeHidden();
});

test('no-JavaScript visitor follows a real full-image link', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/stories/wedding-story/`);
    const opener = page.locator('[data-viewer-trigger="0"]');
    const full = await opener.getAttribute('href');
    await opener.click();
    await expect(page).toHaveURL(`${origin}${full}`);
  } finally { await context.close(); }
});

test('viewer retains keyboard focus when an end control becomes disabled', async ({ page }) => {
  await page.goto(`${origin}/stories/wedding-story/`);
  await page.locator('[data-viewer-trigger="0"]').click();
  const count = await page.locator('[data-viewer-trigger]').count();
  const next = page.locator('[data-viewer-next]');
  const previous = page.locator('[data-viewer-prev]');
  await next.focus();
  for (let index = 1; index < count; index++) await page.keyboard.press('Enter');
  await expect(next).toBeDisabled();
  await expect(previous).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-viewer-close]')).toBeFocused();
  await previous.focus();
  for (let index = 1; index < count; index++) await page.keyboard.press('Enter');
  await expect(previous).toBeDisabled();
  await expect(next).toBeFocused();
});

test('image stories and viewer controls fit narrow and short screens', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${origin}/stories/wedding-story/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator('[data-viewer-trigger="0"]').click();
    for (const selector of ['[data-viewer-close]', '[data-viewer-next]']) {
      const box = await page.locator(selector).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    await page.keyboard.press('Escape');
  }
});

test('synthetic media cold-entry transfer stays within the page budget', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await page.waitForLoadState('networkidle');
  const entries = await page.evaluate(() => [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].map(item => {
    const resource = item as PerformanceResourceTiming;
    return { name: resource.name, bytes: resource.transferSize, type: resource.initiatorType };
  }));
  expect(entries.every(entry => new URL(entry.name).origin === origin)).toBe(true);
  expect(entries.reduce((sum, entry) => sum + entry.bytes, 0)).toBeLessThan(900 * 1024);
  expect(entries.some(entry => entry.type === 'img' && entry.bytes > 0)).toBe(true);
  // These patterns exercise request behavior; they do not establish real-photo quality.
});
