import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('two story routes, accurate checklist counts and usable deep links', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Wedding story', exact: true }).click();
  await expect(page).toHaveURL(/\/stories\/wedding-story\//);
  await expect(page.getByRole('heading', { name: 'Wedding story', exact: true })).toBeVisible();
  await page.locator('[data-content-note="STORY-A-DETAILS-01"] a').click();
  await expect(page.locator('#STORY-A-DETAILS-01')).toBeInViewport();
  await expect(page.locator('[data-slot-item]')).toHaveCount(27);
  await expect(page.locator('.checklist-stats')).toContainText('0 / 27');
  await page.locator('#slot-search').fill('not-a-real-content-item');
  await expect(page.locator('[data-checklist-empty]')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-slot-item]:visible')).toHaveCount(27);
  await page.locator('#slot-search').fill('CONTACT-01');
  await expect(page.locator('[data-slot-item]:visible')).toHaveCount(1);
});

test('gallery is finite, keyboard-operated and restores focus', async ({ page }) => {
  await page.goto('/stories/wedding-story/');
  const opener = page.locator('[data-viewer-trigger="0"]');
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-viewer-close]')).toBeFocused();
  await expect(page.locator('[data-viewer-prev]')).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-viewer-position]')).toHaveText('2 / 6');
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-viewer-position]')).toHaveText('6 / 6');
  await expect(page.locator('[data-viewer-next]')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('[data-viewer-next]')).toBeFocused();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(opener).toBeFocused();
});

test('Play works while focused; new inspection and offscreen pause without restarting', async ({ page }) => {
  await page.goto('/stories/couple-session/');
  const play = page.locator('[data-motion-play]');
  const track = page.locator('[data-motion-track]');
  await play.scrollIntoViewIfNeeded();
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => track.evaluate(el => getComputedStyle(el).transform)).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.locator('[data-motion-reset]').focus();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.focus();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await page.locator('h1').scrollIntoViewIfNeeded();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await play.scrollIntoViewIfNeeded();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-motion-axis]').selectOption('vertical');
  await expect(page.locator('[data-motion-demo]')).toHaveAttribute('data-axis', 'vertical');
  await play.click();
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-motion-reset]').click();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await expect(track).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('OS reduced motion wins over stored Full and updates while running', async ({ page }) => {
  await page.goto('/stories/couple-session/');
  await page.locator('[data-motion-play]').scrollIntoViewIfNeeded();
  await page.locator('[data-motion-play]').click();
  await expect(page.locator('[data-motion-play]')).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'still');
  await expect(page.locator('[data-motion-play]')).toBeDisabled();
  await expect(page.locator('[data-motion-play]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#motion-preference').selectOption('full');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'still');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#motion-preference').selectOption('still');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'still');
});

test('mobile menu closes with Escape, navigation and desktop resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await menu.click();
  await page.locator('#mobile-menu').getByRole('link', { name: 'The work' }).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await menu.click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(menu).toBeHidden();
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await page.locator('.desktop-nav').getByRole('link', { name: 'The approach' }).focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#mobile-menu').getByRole('link', { name: 'The approach' }).focus();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('.desktop-nav').getByRole('link', { name: 'The approach' })).toBeFocused();
});

test('draft enquiry keeps visible removable story context and sends no data', async ({ page }) => {
  const outgoing: string[] = [];
  page.on('request', req => { if (req.method() !== 'GET') outgoing.push(req.url()); });
  await page.goto('/stories/wedding-story/');
  await expect(page.locator('#story-context')).toHaveValue('wedding-story');
  await page.locator('#story-context').selectOption('');
  await expect(page.locator('#story-context')).toHaveValue('');
  await page.locator('#enquiry-name').fill('Test Person');
  await page.locator('#enquiry-email').fill('synthetic@example.com');
  await page.locator('#enquiry-note').fill('Private synthetic test');
  await page.locator('#enquiry-name').press('Enter');
  await page.locator('[data-enquiry-form]').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator('[data-form-message]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sending is not set up' })).toBeDisabled();
  expect(outgoing).toEqual([]);
  expect(page.url()).not.toContain('synthetic');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('synthetic');
  await expect(page.locator('#enquiry-name')).toHaveValue('Test Person');
});

for (const path of ['/', '/stories/wedding-story/', '/stories/couple-session/', '/content-checklist/', '/404/']) {
  test(`accessible document and clean rendered copy at ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(path === '/404/' ? '/404.html' : path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
    const text = await page.locator('body').evaluate(el => el.textContent + Array.from(el.querySelectorAll('*')).map(node => Array.from(node.attributes).map(attr => attr.value).join(' ')).join(' '));
    expect(text).not.toContain(String.fromCharCode(8212));
    expect(errors).toEqual([]);
  });
}

test('viewer and expanded menu pass automated accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stories/couple-session/');
  await page.getByRole('button', { name: 'Menu' }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.locator('[data-viewer-trigger="0"]').click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
});

test('layout reflows at the recorded widths and short landscape sizes', async ({ page }) => {
  const sizes = [320, 360, 390, 430, 719, 720, 721, 768, 820, 1000, 1001, 1024, 1280, 1440, 1920, 2560].map(width => ({ width, height: 900 }));
  sizes.push({ width: 640, height: 360 }, { width: 844, height: 390 });
  for (const path of ['/', '/stories/wedding-story/', '/content-checklist/']) {
    await page.goto(path);
    for (const size of sizes) {
      await page.setViewportSize(size);
      const dimensions = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth }));
      expect(dimensions.page, `${path} at ${size.width}x${size.height}`).toBeLessThanOrEqual(dimensions.width + 1);
    }
  }
});

test('content, navigation and draft form stay safe without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.desktop-nav').getByRole('link', { name: 'The work' })).toBeVisible();
  await expect(page.locator('.desktop-nav').getByRole('link', { name: 'The approach' })).toBeVisible();
  await page.getByRole('heading', { name: 'Couple session', exact: true }).click();
  await expect(page.locator('.story-frame')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Sending is not set up' })).toBeDisabled();
  await context.close();
});

test('checklist returns to a note inside a closed disclosure', async ({ page }) => {
  await page.goto('/content-checklist/#FILM-01');
  await page.locator('#FILM-01').getByRole('link', { name: 'Find this on the draft' }).click();
  await expect(page).toHaveURL(/#content-FILM-01/);
  await expect(page.locator('#content-FILM-01')).toBeVisible();
  await expect(page.locator('#content-FILM-01')).toBeInViewport();
});

test('ordinary Back, Forward and refresh preserve reachable story documents', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Wedding story', exact: true }).click();
  await page.locator('.story-next').getByRole('link').click();
  await expect(page).toHaveURL(/couple-session/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Wedding story', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Couple session', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('#story-context')).toHaveValue('couple-session');
});

test('blocked fonts and unavailable storage preserve the usable draft', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
  await context.route('**/*.woff2', route => route.abort());
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable in this test'); } });
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
  await page.locator('#motion-preference').selectOption('still');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'still');
  expect(errors).toEqual([]);
  await context.close();
});
