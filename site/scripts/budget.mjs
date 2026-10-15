import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, process.argv[2] ?? 'dist');
const reportPath = resolve(root, process.argv[3] ?? 'docs/audits/budget-latest.json');
const KiB = 1024;
const limits = { css: 30 * KiB, javascript: 80 * KiB, html: 35 * KiB, fonts: 100 * KiB, shell: 350 * KiB };

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : [];
  });
}

try {
  const files = walk(dist).sort().map((path) => {
    const content = readFileSync(path);
    const extension = extname(path).toLowerCase();
    const group = extension === '.css' ? 'css'
      : ['.js', '.mjs'].includes(extension) ? 'javascript'
        : extension === '.html' ? 'html'
          : ['.woff2', '.woff', '.ttf', '.otf'].includes(extension) ? 'fonts'
            : ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(extension) ? 'images' : 'other';
    return {
      path: relative(dist, path).replaceAll('\\', '/'),
      group,
      bytes: content.length,
      gzipBytes: ['css', 'javascript', 'html'].includes(group) ? gzipSync(content, { level: 9 }).length : null,
      sha256: createHash('sha256').update(content).digest('hex'),
    };
  });
  const html = files.filter((file) => file.group === 'html');
  if (html.length === 0) throw new Error('No built HTML found. Run the review build before checking its budget.');
  const sum = (group, key) => files.filter((file) => file.group === group).reduce((total, file) => total + file[key], 0);
  const largestHtml = html.reduce((largest, file) => file.gzipBytes > largest.gzipBytes ? file : largest);
  const measured = {
    css: sum('css', 'gzipBytes'),
    javascript: sum('javascript', 'gzipBytes'),
    html: largestHtml.gzipBytes,
    fonts: sum('fonts', 'bytes'),
  };
  measured.shell = measured.css + measured.javascript + measured.html + measured.fonts;
  const checks = Object.entries(limits).map(([name, limitBytes]) => ({
    name, measuredBytes: measured[name], limitBytes, pass: measured[name] <= limitBytes,
  }));
  const result = {
    generatedAt: new Date().toISOString(),
    dist: relative(root, dist),
    artifactSha256: createHash('sha256').update(files.map((file) => `${file.path}\0${file.sha256}\n`).join('')).digest('hex'),
    result: checks.every((check) => check.pass) ? 'pass-artifact-limits' : 'fail-artifact-limits',
    methodology: 'Sum gzip level-9 bytes for every emitted CSS and JS file, the largest gzip HTML file, and raw bytes for every emitted font. This is a conservative file envelope, not a measured initial request graph.',
    limitations: [
      'Inline styles and scripts remain included in HTML. Deferred and route-specific files are included in CSS/JS totals.',
      'The shell figure excludes images, video, headers, transport overhead and third-party requests. Passing it does not establish the complete 350 KiB critical-transfer target.',
      'The 900 KiB cold-entry, 3 MiB homepage and 6 MiB story targets need browser request measurements with real content.',
      'Gzip estimates do not verify hosting compression. Image quality, LCP, INP, CLS, actual font requests and device performance remain separate checks.',
    ],
    largestHtml: largestHtml.path,
    imageInventory: { count: files.filter((file) => file.group === 'images').length, bytes: sum('images', 'bytes') },
    checks,
    files,
  };
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
  const archiveName = `${result.generatedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')}-budget-${result.artifactSha256.slice(0, 12)}.json`;
  const archivePath = join(dirname(reportPath), archiveName);
  writeFileSync(archivePath, `${JSON.stringify(result, null, 2)}\n`);
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}: ${(check.measuredBytes / KiB).toFixed(2)} / ${(check.limitBytes / KiB).toFixed(0)} KiB`);
  }
  console.log(`Evidence: ${relative(root, reportPath)}`);
  console.log(`Snapshot: ${relative(root, archivePath)}`);
  console.log('Artifact limits do not establish image-loading or browser performance results.');
  if (!checks.every((check) => check.pass)) process.exitCode = 1;
} catch (error) {
  console.error(`Budget check failed: ${error.message}`);
  process.exitCode = 1;
}
