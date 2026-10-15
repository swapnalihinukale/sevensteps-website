import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:4324';

test('responsive image declarations match rendered columns and spanning frames', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [320, 380, 381, 720, 721, 1000, 1001, 1440, 1599, 1600, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/stories/wedding-story/']) {
      await page.goto(`${origin}${route}`);
      const rows = await page.evaluate(() => {
        const split = (source: string) => {
          let depth = 0; let last = 0; const parts: string[] = [];
          for (let index = 0; index < source.length; index++) {
            if (source[index] === '(') depth++;
            if (source[index] === ')') depth--;
            if (source[index] === ',' && depth === 0) { parts.push(source.slice(last, index).trim()); last = index + 1; }
          }
          return [...parts, source.slice(last).trim()];
        };
        const selector = '.hero-main img, .hero-companion img, .work-card img, .about-space img, .story-cover img, .story-frame img';
        return [...document.querySelectorAll<HTMLImageElement>(selector)].map(img => {
          const source = img.getAttribute('sizes') ?? '';
          let expression = '';
          for (const part of split(source)) {
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
          return { source, expression, declared, actual: img.getBoundingClientRect().width, alt: img.alt };
        });
      });
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.source, `${width}px ${route}: image declaration exists`).toBeTruthy();
        expect(Math.abs(row.actual - row.declared), `${width}px ${route}: ${row.alt}, declared ${row.declared}px vs rendered ${row.actual}px using ${row.expression}`).toBeLessThanOrEqual(2);
      }
    }
  }
});
