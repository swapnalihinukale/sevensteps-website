import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'http://127.0.0.1:4323';
test.use({ baseURL: origin });
const status = (page: Page) => page.locator('[data-enquiry-status]');
async function fill(page: Page, path = '/') {
  await page.goto(path);
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
}

test('designed homepage submits with keyboard, locks pending fields and retains a truthful test receipt', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (!request.url().startsWith(origin)) external.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('[data-enquiry-form]')).toHaveCount(0);
  await expect(page.locator('#draft-form-notice')).toContainText('Local enquiry test');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await page.keyboard.type('Sample Couple');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email address', { exact: true })).toBeFocused();
  await page.keyboard.type('sample@example.test');
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  let posts = 0;
  await page.route('**/api/enquiries', async route => { posts++; await held; await route.continue(); });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(status(page)).toHaveText('Sending your test enquiry…');
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enquiry received', exact: true })).toHaveCount(0);
  const response = page.waitForResponse(r => r.url().endsWith('/api/enquiries') && r.status() === 201);
  release();
  const receipt = (await (await response).json()).receipt;
  await expect(status(page)).toContainText(`Test enquiry received on this computer. Your reference is ${receipt}. No email was sent.`);
  expect(posts).toBe(1);
  expect(external).toEqual([]);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('sevensteps-enquiry-v1')!)))
    .toEqual({ phase: 'received', receipt });
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.reload();
  await expect(status(page)).toContainText(receipt);
  await expect(page.getByLabel('Your name', { exact: true })).toBeEmpty();
  await page.getByRole('button', { name: 'Start a new enquiry' }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await expect(status(page)).toBeEmpty();
});

test('story form keeps removable context and focuses linked server errors without losing details', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await fill(page, '/stories/wedding-story/');
  await expect(page.getByLabel('Story you’re interested in')).toHaveValue('wedding-story');
  await page.getByLabel('Story you’re interested in').selectOption('');
  await page.getByLabel('Your name', { exact: true }).fill('<Sample>');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-enquiry-errors]')).toBeFocused();
  await expect(page.getByLabel('Your name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('sample@example.test');
  await page.locator('[data-enquiry-errors] a').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await page.getByLabel('Your name', { exact: true }).fill('A'.repeat(100));
  await page.getByLabel('Where (optional)').fill('Test place '.repeat(18));
  await page.getByLabel('A little about your plans (optional)').fill('界'.repeat(4000));
  const response = page.waitForResponse(r => r.url().endsWith('/api/enquiries') && r.status() === 201);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  const request = (await response).request().postDataJSON();
  expect(request.enquiry.story).toBe('');
  expect(request.enquiry.message.length).toBe(4000);
  await expect(status(page)).toContainText('Test enquiry received');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Start a new enquiry' }).click();
  await page.goto('/stories/couple-session/');
  await expect(page.getByLabel('Story you’re interested in')).toHaveValue('couple-session');
});

test('styled form retries a lost acknowledgement with the same immutable details and durable receipt', async ({ page }) => {
  await fill(page);
  let receipt = ''; let firstBody: unknown;
  await page.route('**/api/enquiries', async route => {
    firstBody = route.request().postDataJSON();
    const response = await route.fetch();
    expect(response.status()).toBe(201);
    receipt = (await response.json()).receipt;
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(status(page)).toContainText('could not confirm receipt');
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Sample Couple');
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled();
  expect(await page.evaluate(() => sessionStorage.getItem('sevensteps-enquiry-v1'))).not.toContain('Sample');
  await page.unroute('**/api/enquiries');
  const response = page.waitForResponse(r => r.url().endsWith('/api/enquiries') && r.status() === 200);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  const repeated = await response;
  expect(repeated.request().postDataJSON()).toEqual(firstBody);
  expect((await repeated.json()).receipt).toBe(receipt);
  await expect(status(page)).toContainText(receipt);
  await expect(page.getByRole('button', { name: 'Enquiry received', exact: true })).toBeDisabled();
});

test('styled form without JavaScript stays disabled and never puts entered details in a URL', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const submissions: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/')) submissions.push(request.url()); });
  await page.goto(`${origin}/stories/couple-session/`);
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await expect(page.locator('noscript .form-notice')).toBeVisible();
  await expect(page.locator('noscript .form-notice')).toHaveText('Enable JavaScript to use this local test. Nothing has been sent.');
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
  await page.getByLabel('Email address', { exact: true }).press('Enter');
  expect(submissions).toEqual([]);
  expect(page.url()).toBe(`${origin}/stories/couple-session/`);
  await context.close();
});

test('styled form explains blocked reference storage before it sends any data', async ({ page }) => {
  const submissions: string[] = [];
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); }; });
  page.on('request', request => { if (request.url().includes('/api/')) submissions.push(request.url()); });
  await page.goto('/');
  await expect(status(page)).toContainText('reference needed for a safe retry');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  expect(submissions).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('local website server confines active assets to its loopback host and build directory', async ({ request }) => {
  const home = await request.get('/');
  expect(home.status()).toBe(200);
  expect(home.headers()['x-robots-tag']).toBe('noindex, nofollow');
  expect(home.headers()['cache-control']).toBe('no-store');
  expect((await request.get('/', { headers: { host: 'untrusted.example' } })).status()).toBe(403);
  expect((await request.get('/.env')).status()).toBe(404);
  expect((await request.get('/%2e%2e/package.json')).status()).toBe(404);
  expect((await request.post('/')).status()).toBe(405);
  const client = await request.get('/local-enquiry-client.js');
  expect(await client.text()).toContain(`location.origin === "${origin}"`);
});
