import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'http://127.0.0.1:4324';
const reviewOrigin = 'http://127.0.0.1:4321';
const storyPaths = [
  '/stories/wedding-story/',
  '/stories/couple-session/',
  '/stories/sample-celebration/',
  '/stories/sample-gathering/',
];
const storyTitles = ['A sample wedding story', 'A sample couple session', 'A third sample story', 'A fourth sample story'];
test.use({ baseURL: origin });

test('homepage shows the selected pair and the archive exposes every story', async ({ page }) => {
  await page.goto('/');
  const featured = page.locator('#work .work-card > a');
  await expect(featured).toHaveCount(2);
  expect(await featured.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual([storyPaths[0], storyPaths[2]]);
  await page.getByRole('link', { name: 'View all stories', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/stories/`);
  await expect(page.getByRole('heading', { name: 'All stories.', level: 1 })).toBeVisible();
  const cards = page.locator('.portfolio-grid .work-card > a');
  await expect(cards).toHaveCount(4);
  expect(await cards.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(storyPaths);
  expect(await cards.evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).origin))).toEqual(Array(4).fill(origin));
  await expect(page.locator('.portfolio-grid img[loading="lazy"]')).toHaveCount(3);
  await expect(page.locator('.portfolio-grid img[loading="eager"][fetchpriority="high"]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The work', exact: true })).toHaveAttribute('aria-current', 'page');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('direct story routes follow portfolio order and wrap to the first story', async ({ page }) => {
  for (let index = 0; index < storyPaths.length; index++) {
    const response = await page.goto(storyPaths[index]);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitles[index]);
    await expect(page.locator('.breadcrumb a')).toHaveAttribute('href', '/stories/');
    await expect(page.locator('.story-next > a')).toHaveAttribute('href', storyPaths[(index + 1) % storyPaths.length]);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The work', exact: true })).toHaveAttribute('href', '/stories/');
    await expect(page.locator('.wordmark')).toHaveAttribute('href', '/');
  }
  await page.locator('.story-next > a').click();
  await expect(page).toHaveURL(`${origin}${storyPaths[0]}`);
  const missing = await page.goto('/stories/no-such-assignment/');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('isn’t here');
  await page.getByRole('link', { name: 'Back to the homepage', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/`);
});

test('portfolio canonicals and sitemap describe one origin and every public route', async ({ page, request }) => {
  const paths = ['/', '/stories/', ...storyPaths];
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const locations = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  expect(locations).toEqual(paths.map(path => `https://example.invalid${path}`));
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://example.invalid${path}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://example.invalid${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('[data-content-note], [data-slot-item]')).toHaveCount(0);
  }
  expect((await request.get('/content-checklist/')).status()).toBe(404);
});

test('two-story review keeps its placeholders and does not expose an archive', async ({ page, request }) => {
  await page.goto(reviewOrigin);
  const cards = page.locator('#work .work-card > a');
  await expect(cards).toHaveCount(2);
  expect(await cards.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(storyPaths.slice(0, 2));
  await expect(page.getByRole('link', { name: 'View all stories', exact: true })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The work', exact: true })).toHaveAttribute('href', '/#work');
  await expect(page.locator('[data-enquiry-form] button')).toBeDisabled();
  await page.goto(`${reviewOrigin}/content-checklist/`);
  await expect(page.locator('[data-slot-item]')).toHaveCount(27);
  expect((await request.get(`${reviewOrigin}/stories/`)).status()).toBe(404);
  expect((await request.get(`${reviewOrigin}${storyPaths[2]}`)).status()).toBe(404);
});

test('small-screen keyboard navigation reaches an additional story and its viewer', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  // macOS WebKit uses Option+Tab to include links in keyboard traversal.
  await page.keyboard.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
  const work = page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'The work', exact: true });
  await expect(work).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${origin}/stories/`);
  const extraStory = page.locator(`.portfolio-grid a[href="${storyPaths[2]}"]`);
  await extraStory.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${origin}${storyPaths[2]}`);
  const opener = page.locator('[data-viewer-trigger="0"]');
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-viewer-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('archive and additional stories remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/`);
    await page.getByRole('link', { name: 'View all stories', exact: true }).click();
    await expect(page).toHaveURL(`${origin}/stories/`);
    await expect(page.locator('.portfolio-grid .work-card')).toHaveCount(4);
    await page.locator(`.portfolio-grid a[href="${storyPaths[2]}"]`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitles[2]);
    await page.locator('.story-next > a').click();
    await expect(page).toHaveURL(`${origin}${storyPaths[3]}`);
    await page.locator('.breadcrumb a').click();
    await expect(page).toHaveURL(`${origin}/stories/`);
  } finally { await context.close(); }
});

test('archive cover sizes match both columns at breakpoint neighbours and wide screens', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [320, 380, 381, 720, 721, 1000, 1001, 1440, 1599, 1600, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/stories/');
    const rows = await page.locator('.portfolio-grid img').evaluateAll(images => images.map(image => {
      const source = image.getAttribute('sizes') ?? '';
      const parts: string[] = [];
      let depth = 0; let last = 0;
      for (let index = 0; index < source.length; index++) {
        if (source[index] === '(') depth++;
        if (source[index] === ')') depth--;
        if (source[index] === ',' && depth === 0) { parts.push(source.slice(last, index).trim()); last = index + 1; }
      }
      parts.push(source.slice(last).trim());
      let expression = '';
      for (const part of parts) {
        const rule = /^(\((?:min|max)-width:\s*\d+px\))\s+(.+)$/u.exec(part);
        if (!rule) { expression = part; break; }
        if (matchMedia(rule[1]).matches) { expression = rule[2]; break; }
      }
      const measure = document.createElement('div');
      measure.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;height:0;padding:0;border:0';
      measure.style.width = expression;
      document.body.append(measure);
      const declared = measure.getBoundingClientRect().width;
      measure.remove();
      return { source, declared, actual: image.getBoundingClientRect().width };
    }));
    expect(rows).toHaveLength(4);
    for (const [index, row] of rows.entries()) {
      expect(row.source).toBeTruthy();
      expect(Math.abs(row.actual - row.declared), `${width}px card ${index + 1}: declared ${row.declared}px, rendered ${row.actual}px`).toBeLessThanOrEqual(2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});
