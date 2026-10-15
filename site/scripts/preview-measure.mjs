import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const screenshotsOnly = args.includes('--screenshots-only');
const url = new URL(args.find((arg) => !arg.startsWith('--')) ?? 'http://127.0.0.1:4321/');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !['http:', 'https:'].includes(url.protocol)) {
  throw new Error('This measurement is restricted to the local private preview.');
}
const stamp = new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
const auditDir = join(root, 'docs', 'audits');
const screenshotDir = join(root, 'docs', 'screenshots');
mkdirSync(auditDir, { recursive: true });
mkdirSync(screenshotDir, { recursive: true });
const prohibited = [];
const report = {
  generatedAt: new Date().toISOString(),
  url: url.href,
  mode: screenshotsOnly ? 'screenshots-only' : 'measurement-and-screenshots',
  result: 'pending',
  purpose: 'Private placeholder-only preview measurements and visual captures. No form submissions.',
  profile: {
    applied: !screenshotsOnly,
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true,
    cache: 'Fresh isolated context plus Chromium cache disabled',
    sampleTargetMs: 10_000,
    network: { latencyMs: 150, downloadBytesPerSecond: 200_000, uploadBytesPerSecond: 93_750 },
    cpuSlowdownMultiplier: 4,
    calibration: 'Uncalibrated desktop Chromium throttling; not a physical phone measurement.',
  },
  limitations: [
    'The page contains placeholders. It does not establish the load cost, compression quality or LCP of a page with real photography.',
    'Observed LCP and CLS cover this one synthetic 10-second window. They are not field Core Web Vitals or a 75th-percentile result.',
    'Resource Timing covers completed exposed entries. Zero sizes, missing entries and in-flight requests need interpretation; totals exclude transport overhead not represented by the browser.',
    'No user interactions are measured, so this run does not measure INP or verify the menu, form or viewer.',
    'Additional route screenshots use separate unthrottled contexts and are visual evidence, not performance samples.',
  ],
  prohibitedRequests: prohibited,
};

let browser;
async function guard(context, label) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const target = new URL(request.url());
    const external = ['http:', 'https:'].includes(target.protocol) && target.origin !== url.origin;
    const media = request.resourceType() === 'media';
    if (external || media) {
      prohibited.push({ context: label, url: request.url(), resourceType: request.resourceType(), reason: external ? 'external origin' : 'media/player request' });
      await route.abort('blockedbyclient');
    } else await route.continue();
  });
}

try {
  browser = await chromium.launch({ headless: true });
  report.browserVersion = browser.version();
  if (!screenshotsOnly) {
  const context = await browser.newContext({ viewport: report.profile.viewport, deviceScaleFactor: 1, hasTouch: true, serviceWorkers: 'block' });
  await guard(context, 'mobile-measurement');
  const page = await context.newPage();
  const requests = [];
  const inflight = new Set();
  const consoleErrors = [];
  page.on('request', (request) => {
    inflight.add(request);
    requests.push({ url: request.url(), resourceType: request.resourceType(), method: request.method() });
  });
  page.on('requestfinished', (request) => inflight.delete(request));
  page.on('requestfailed', (request) => inflight.delete(request));
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: report.profile.network.latencyMs, downloadThroughput: report.profile.network.downloadBytesPerSecond, uploadThroughput: report.profile.network.uploadBytesPerSecond, connectionType: 'cellular3g' });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: report.profile.cpuSlowdownMultiplier });
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000);
    window.__previewMetrics = { lcp: [], shifts: [], supported: PerformanceObserver.supportedEntryTypes };
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__previewMetrics.lcp.push({ startTime: entry.startTime, renderTime: entry.renderTime, loadTime: entry.loadTime, size: entry.size, element: entry.element ? { tag: entry.element.tagName, id: entry.element.id } : null });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__previewMetrics.shifts.push({ startTime: entry.startTime, value: entry.value, hadRecentInput: entry.hadRecentInput });
      }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  const response = await page.goto(url.href, { waitUntil: 'commit', timeout: 30_000 });
  report.httpStatus = response?.status() ?? null;
  if (!response?.ok()) throw new Error(`Preview navigation returned ${report.httpStatus}.`);
  // This wait defines the requested measurement window; it is not UI readiness polling.
  await page.evaluate(() => new Promise((done) => setTimeout(done, Math.max(0, 10_000 - performance.now()))));
  const metrics = await page.evaluate(() => {
    const fields = (entry) => ({ name: entry.name, initiatorType: entry.initiatorType ?? 'navigation', startTime: entry.startTime, responseEnd: entry.responseEnd, duration: entry.duration, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize });
    const navigation = performance.getEntriesByType('navigation').map(fields);
    const resources = performance.getEntriesByType('resource').map(fields);
    const shifts = window.__previewMetrics.shifts.filter((entry) => !entry.hadRecentInput);
    let cls = 0;
    let sessionValue = 0;
    let sessionStart = null;
    let previousShift = 0;
    for (const shift of shifts) {
      if (sessionStart !== null && shift.startTime - previousShift < 1000 && shift.startTime - sessionStart < 5000) sessionValue += shift.value;
      else { sessionValue = shift.value; sessionStart = shift.startTime; }
      previousShift = shift.startTime;
      cls = Math.max(cls, sessionValue);
    }
    return {
      sampleDurationMs: performance.now(), navigation, resources,
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio, documentWidth: document.documentElement.scrollWidth },
      lcp: window.__previewMetrics.lcp.at(-1) ?? null,
      cls: window.__previewMetrics.supported.includes('layout-shift') ? cls : null,
      layoutShifts: shifts,
      performanceObserverTypes: window.__previewMetrics.supported,
      playerElements: [...document.querySelectorAll('video,audio,iframe')].map((element) => ({ tag: element.tagName, src: element.getAttribute('src') })),
      developmentClientDetected: Boolean(document.querySelector('script[src*="/@vite/client"]')),
      userAgent: navigator.userAgent,
    };
  });
  const timingEntries = [...metrics.navigation, ...metrics.resources];
  report.mobile = {
    ...metrics, requests: [...requests], requestCount: requests.length,
    inflightAtSample: [...inflight].map((request) => request.url()),
    consoleErrors: [...consoleErrors],
    timingTotals: Object.fromEntries(['transferSize', 'encodedBodySize', 'decodedBodySize'].map((key) => [key, timingEntries.reduce((total, entry) => total + (entry[key] ?? 0), 0)])),
    completedResourceEntryCount: metrics.resources.length,
    coldEntryTargetBytes: 900 * 1024,
    interpretation: 'Compare the completed Timing totals with the target only after checking in-flight, blocked and missing entries. No real-photography performance claim.',
  };
  const mobilePath = join(screenshotDir, `${stamp}-mobile-390.png`);
  const mobileFullPath = join(screenshotDir, `${stamp}-mobile-390-full.png`);
  await page.screenshot({ path: mobilePath, fullPage: false });
  await page.screenshot({ path: mobileFullPath, fullPage: true });
  report.screenshots = { mobile: relative(root, mobilePath), mobileFull: relative(root, mobileFullPath) };
  await context.close();
  }

  report.screenshots ??= {};
  report.pageCaptures = [];
  const routes = [
    { key: 'home', path: '/' },
    { key: 'wedding', path: '/stories/wedding-story/' },
    { key: 'checklist', path: '/content-checklist/' },
  ];
  const viewports = [
    { key: 'mobile-390', size: { width: 390, height: 844 } },
    { key: 'desktop-1440', size: { width: 1440, height: 1000 } },
  ];
  for (const viewport of viewports) {
    const captureContext = await browser.newContext({ viewport: viewport.size, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await guard(captureContext, `${viewport.key}-screenshots`);
    const capturePage = await captureContext.newPage();
    for (const route of routes) {
      if (!screenshotsOnly && viewport.key === 'mobile-390' && route.key === 'home') continue;
      const target = new URL(route.path, url);
      const response = await capturePage.goto(target.href, { waitUntil: 'load', timeout: 30_000 });
      if (!response?.ok()) throw new Error(`Screenshot navigation ${target.pathname} returned ${response?.status() ?? 'no response'}.`);
      await capturePage.evaluate(() => document.fonts.ready);
      const prefix = route.key === 'home' ? `${stamp}-${viewport.key}` : `${stamp}-${route.key}-${viewport.key}`;
      const viewportPath = join(screenshotDir, `${prefix}.png`);
      const fullPath = join(screenshotDir, `${prefix}-full.png`);
      await capturePage.screenshot({ path: viewportPath, fullPage: false, animations: 'disabled' });
      await capturePage.screenshot({ path: fullPath, fullPage: true, animations: 'disabled' });
      const geometry = await capturePage.evaluate(() => ({ width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight }));
      report.pageCaptures.push({ route: route.path, viewport: viewport.size, geometry, screenshot: relative(root, viewportPath), fullPage: relative(root, fullPath), mode: 'Unthrottled visual capture with finite screenshot animations completed; no performance claim.' });
      if (route.key === 'home') {
        const key = viewport.key.startsWith('mobile') ? 'mobile' : 'desktop';
        report.screenshots[key] = relative(root, viewportPath);
        report.screenshots[`${key}Full`] = relative(root, fullPath);
      }
    }
    await captureContext.close();
  }
  report.desktopViewport = { width: 1440, height: 1000, deviceScaleFactor: 1 };
  report.result = prohibited.length || report.mobile?.playerElements.length || report.mobile?.consoleErrors.length ? 'needs-review' : 'captured';
  if (report.result === 'needs-review') process.exitCode = 1;
} catch (error) {
  report.result = 'failed';
  report.error = error.message;
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  const filename = `${stamp}-preview-measure.json`;
  writeFileSync(join(auditDir, filename), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ report: `docs/audits/${filename}`, result: report.result, mode: report.mode, error: report.error, browserVersion: report.browserVersion, timingTotals: report.mobile?.timingTotals, observedLcpMs: report.mobile?.lcp?.startTime ?? null, observedCls: report.mobile?.cls ?? null, prohibitedRequests: prohibited, screenshots: report.screenshots, pageCaptures: report.pageCaptures }, null, 2));
}
