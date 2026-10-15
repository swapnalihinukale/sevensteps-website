import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ baseURL: 'http://127.0.0.1:4322' });
async function fill(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
  await page.getByLabel('A little about your plans (optional)').fill('Synthetic local enquiry for testing.');
}
test('local enquiry commits before receipt, stores only a reference and sends no external request', async ({ page }) => {
  const external: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4322')) external.push(request.url()); });
  await fill(page);
  const response = page.waitForResponse(r => r.url().endsWith('/api/enquiries') && r.status() === 201);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  const receipt = (await (await response).json()).receipt;
  await expect(page.getByRole('status')).toContainText(receipt);
  await expect(page.getByRole('button', { name: 'Enquiry received' })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('sevensteps-enquiry-v1')!)))
    .toEqual({ phase: 'received', receipt });
  expect(page.url()).toBe('http://127.0.0.1:4322/');
  expect(external).toEqual([]);
  await page.reload();
  await expect(page.getByRole('status')).toContainText(receipt);
  await expect(page.getByRole('button', { name: 'Enquiry received' })).toBeDisabled();
  await page.getByRole('button', { name: 'Start a new enquiry' }).click();
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await expect(page.getByRole('status')).toBeEmpty();
});
test('lost acknowledgement retries the same token and returns the original durable receipt', async ({ page }) => {
  await fill(page);
  let receipt = ''; let firstToken = '';
  await page.route('**/api/enquiries', async route => {
    firstToken = route.request().postDataJSON().token;
    const committed = await route.fetch();
    expect(committed.status()).toBe(201);
    receipt = (await committed.json()).receipt;
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not confirm receipt');
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Sample Couple');
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled();
  await page.unroute('**/api/enquiries');
  const response = page.waitForResponse(r => r.url().endsWith('/api/enquiries') && r.status() === 200);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  const repeated = await response;
  expect(repeated.request().postDataJSON().token).toBe(firstToken);
  expect((await repeated.json()).receipt).toBe(receipt);
  await expect(page.getByRole('status')).toContainText(receipt);
});
test('server validation shows a focused, linked error and preserves entered values', async ({ page }) => {
  await fill(page);
  await page.getByLabel('Your name', { exact: true }).fill('<Sample>');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('[data-enquiry-errors]')).toBeFocused();
  await expect(page.getByLabel('Your name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('sample@example.test');
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('We have received your enquiry');
});
test('offline token fetch keeps fields editable and avoids false receipt', async ({ page, context }) => {
  await fill(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not confirm receipt');
  await expect(page.getByLabel('Your name', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('sample@example.test');
  await context.setOffline(false);
});
test('malformed success cannot display receipt; mobile form is accessible without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await fill(page);
  await page.route('**/api/enquiries', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":"received"}' }));
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not confirm receipt');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('without JavaScript the synthetic form stays non-sending and keeps data out of URLs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const submissions: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/')) submissions.push(request.url()); });
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeDisabled();
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
  await page.getByLabel('Email address', { exact: true }).press('Enter');
  expect(submissions).toEqual([]);
  expect(page.url()).toBe('http://127.0.0.1:4322/');
  await context.close();
});

test('reload after uncertain receipt reuses the reference and requires re-entering the same details', async ({ page }) => {
  await fill(page);
  let receipt = ''; let token = '';
  await page.route('**/api/enquiries', async route => {
    token = route.request().postDataJSON().token;
    receipt = (await (await route.fetch()).json()).receipt;
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not confirm receipt');
  const stored = await page.evaluate(() => sessionStorage.getItem('sevensteps-enquiry-v1'));
  expect(JSON.parse(stored!)).toEqual({ phase: 'pending', token });
  expect(stored).not.toContain('Sample');
  expect(stored).not.toContain('@');
  await page.unroute('**/api/enquiries');
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Enter the same details');
  await expect(page.getByLabel('Your name', { exact: true })).toBeEmpty();
  await page.getByLabel('Your name', { exact: true }).fill('Sample Couple');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
  await page.getByLabel('A little about your plans (optional)').fill('Synthetic local enquiry for testing.');
  await page.getByRole('button', { name: 'Retry earlier enquiry' }).click();
  await expect(page.getByRole('status')).toContainText(receipt);
});

test('blocked reference storage stops before a submission and explains recovery', async ({ page }) => {
  const submissions: string[] = [];
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); }; });
  page.on('request', request => { if (request.url().endsWith('/api/enquiries')) submissions.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('reference needed for a safe retry');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  expect(submissions).toEqual([]);
});
