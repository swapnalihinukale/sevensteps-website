import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const requiredFiles = [
  'index.html', '404.html', 'content-checklist/index.html',
  'stories/wedding-story/index.html', 'stories/couple-session/index.html',
  'favicon.svg', 'robots.txt', 'sitemap.xml',
  'licenses/source-sans-3-OFL.txt', 'licenses/source-serif-4-OFL.txt',
];
const allowedDirectories = new Set(['_astro', 'content-checklist', 'stories', 'stories/wedding-story', 'stories/couple-session', 'licenses']);
const pagePaths = requiredFiles.filter(path => path.endsWith('.html'));
const formPages = new Set(['index.html', 'stories/wedding-story/index.html', 'stories/couple-session/index.html']);
const frozenTime = new Date('2000-01-01T00:00:00.000Z');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

export const reviewHeaders = `/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: no-store
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'none'; media-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; worker-src 'none'; manifest-src 'none'
`;

function refuse(reason) { throw new Error(`Review package refused: ${reason}.`); }
function below(root, path) {
  const part = relative(root, path);
  return part !== '' && part !== '..' && !part.startsWith(`..${sep}`) && !part.startsWith(sep);
}
function inspectSecrets(source) {
  const rules = [
    /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    /\bnpm_[A-Za-z0-9]{36,}\b/,
    /\b(?:https?|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s/@:'"<>]+:[^\s/@'"<>]{4,}@/,
    /(?:\b(?:RESEND_API_KEY|NETLIFY_AUTH_TOKEN|DATABASE_URL|GITHUB_TOKEN)\b\s*[:=]\s*["'`]?)[^\s"'`;]{8,}/,
    /(?:file:\/\/|\/Users\/|\/home\/|\.local\/|\.env\b|\.netlify\/)/,
  ];
  if (rules.some(rule => rule.test(source))) refuse('credential or private source material');
}

function attributes(source) {
  const result = new Map();
  // Astro emits quoted attribute values and ordinary boolean attributes.
  const expression = /\s+([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/gy;
  let offset = 0;
  while (offset < source.length) {
    expression.lastIndex = offset;
    const match = expression.exec(source);
    if (!match) {
      if (/^\s*\/?\s*$/.test(source.slice(offset))) break;
      refuse('unsupported HTML attribute syntax');
    }
    const name = match[1].toLowerCase();
    if (result.has(name)) refuse('duplicate HTML attribute');
    result.set(name, match[2] ?? match[3] ?? '');
    offset = expression.lastIndex;
  }
  return result;
}

function localReference(value, page, files) {
  if (!value || !/^(?:\/(?!\/)|#)/.test(value) || /[\\\u0000-\u0020]/u.test(value)) refuse('nonlocal page or asset reference');
  let url;
  try { url = new URL(value, `https://review.invalid/${page.replace(/index\.html$/, '')}`); }
  catch { refuse('invalid local reference'); }
  if (url.origin !== 'https://review.invalid' || url.search) refuse('unexpected destination');
  let target;
  try { target = decodeURIComponent(url.pathname).slice(1); } catch { refuse('invalid escaped reference'); }
  if (!target || target.endsWith('/')) target += 'index.html';
  if (!files.has(target)) refuse('missing local destination');
  if (url.hash && target.endsWith('.html')) {
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { refuse('invalid escaped fragment'); }
    const ids = [...files.get(target).toString('utf8').matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    if (!ids.includes(id)) refuse('missing local fragment');
  }
  return target;
}

function inspectCss(source, page, files) {
  // This export supports the current plain generated CSS. Escaped tokens can
  // hide a URL function or resource type and need a new explicit review.
  if (/\\|@import\b/i.test(source)) refuse('CSS escapes or imports are not allowed');
  for (const [, expression] of source.matchAll(/url\(\s*([^)]*?)\s*\)/gi)) {
    const value = expression.replace(/^(?:"([^"]*)"|'([^']*)')$/, (_, double, single) => double ?? single);
    const target = localReference(value, page, files);
    if (!target.endsWith('.woff2')) refuse('CSS can load only the selected fonts');
  }
}

function decodeStyle(value) {
  return value.replace(/&(?:#(x[0-9a-f]+|[0-9]+)|(amp|quot|apos|lt|gt));/gi, (_, numeric, named) => {
    if (!numeric) return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[named.toLowerCase()];
    const point = Number.parseInt(numeric.replace(/^x/i, ''), /^x/i.test(numeric) ? 16 : 10);
    if (point > 0x10ffff || point === 0) refuse('invalid encoded style');
    return String.fromCodePoint(point);
  });
}

function inspectHtml(path, source, files) {
  let robots = false;
  let formCount = 0;
  let scriptCount = 0;
  if (!source.includes('Website draft.') || !source.includes('content-checklist')) refuse('missing ordinary review notice');
  for (const match of source.matchAll(/<([a-zA-Z][\w:-]*)\b([^<>]*)>/g)) {
    const tag = match[1].toLowerCase();
    const attrs = attributes(match[2]);
    if (['img', 'picture', 'source', 'video', 'audio', 'iframe', 'object', 'embed', 'image', 'foreignobject', 'base'].includes(tag)) refuse('media, embedding or base URL is not allowed in a placeholder review');
    if ([...attrs.keys()].some(name => /^on/i.test(name) || ['srcdoc', 'srcset', 'formaction', 'formenctype', 'formtarget', 'data-enquiry-active-form', 'data-photo-id', 'data-netlify', 'netlify'].includes(name))) refuse('active content or integration markup');
    if (tag === 'meta') {
      if (attrs.get('http-equiv')) refuse('HTTP-equivalent metadata');
      if (attrs.get('name')?.toLowerCase() === 'robots') {
        if (robots || attrs.get('content')?.trim().toLowerCase() !== 'noindex, nofollow') refuse('review indexing metadata');
        robots = true;
      }
    }
    if (tag === 'form') {
      formCount++;
      if (!attrs.has('data-enquiry-form') || ['action', 'method', 'target', 'enctype', 'name'].some(name => attrs.has(name))) refuse('form can submit or is not the ordinary review form');
    }
    if (['input', 'textarea', 'select', 'button'].includes(tag) && attrs.has('name')) refuse('named form controls can send data');
    if (tag === 'input' && ['submit', 'image'].includes(attrs.get('type')?.toLowerCase())) refuse('submit controls are not allowed');
    if (tag === 'script') {
      scriptCount++;
      if (attrs.get('type') !== 'module' || !/^\/_astro\/[\w.-]+\.js$/.test(attrs.get('src') ?? '')) refuse('script is not a built local module');
      const rest = source.slice(match.index + match[0].length);
      if (!/^\s*<\/script\s*>/i.test(rest)) refuse('inline script content');
    }
    if (attrs.has('style')) inspectCss(decodeStyle(attrs.get('style')), path, files);
    for (const name of ['src', 'href', 'xlink:href']) if (attrs.has(name)) localReference(attrs.get(name), path, files);
  }
  for (const [, style] of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) inspectCss(style, path, files);
  if (!robots || scriptCount < 1) refuse('missing review metadata or script');
  if (formPages.has(path)) {
    if (formCount !== 1 || !source.includes('Photograph to add') || !source.includes('This draft does not send or save them.')) refuse('missing placeholder or non-sending form notice');
    const form = /<form\b[^>]*>([\s\S]*?)<\/form\s*>/i.exec(source)?.[1];
    if (!form) refuse('incomplete review form');
    let disabledButton = false;
    for (const match of form.matchAll(/<button\b([^<>]*)>/gi)) {
      const attrs = attributes(match[1]);
      if (attrs.get('type') !== 'button' || !attrs.has('disabled')) refuse('review form has an enabled or implicit submit button');
      disabledButton = true;
    }
    if (!disabledButton) refuse('missing disabled submission control');
  } else if (formCount) refuse('unexpected form on review support page');
  if (path === 'content-checklist/index.html' && [...source.matchAll(/\sdata-slot-item(?:[\s=>])/g)].length !== 27) refuse('review checklist must retain the 27 content groups');
}

/** Snapshot verified bytes before packaging. No source file is modified. */
export function verifyReviewDist(sourceDirectory) {
  const root = resolve(sourceDirectory);
  if (basename(root) !== 'dist' || !existsSync(root) || lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory()) refuse('select the ordinary dist directory');
  const files = new Map();
  let total = 0;
  function walk(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      const path = prefix ? `${prefix}/${name}` : name;
      const location = join(directory, name);
      const entry = lstatSync(location);
      if (entry.isSymbolicLink()) refuse('symbolic links are not allowed');
      if (entry.isDirectory()) {
        if (!allowedDirectories.has(path)) refuse('unexpected directory');
        walk(location, path);
      } else {
        if (!entry.isFile() || (!requiredFiles.includes(path) && !/^_astro\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:js|css|woff2)$/.test(path))) refuse('unexpected static file');
        if (entry.size > 2 * 1024 * 1024 || files.size >= 64 || (total += entry.size) > 12 * 1024 * 1024) refuse('review package exceeds the static file limits');
        const bytes = readFileSync(location);
        if (bytes.length !== entry.size) refuse('source changed while reading');
        files.set(path, bytes);
      }
    }
  }
  walk(root);
  if (requiredFiles.some(path => !files.has(path))) refuse('required review file is missing');
  const fontFiles = [...files.keys()].filter(path => path.endsWith('.woff2'));
  if (fontFiles.length !== 2 || !fontFiles.every(path => /^_astro\/source-(?:sans-3|serif-4)-latin-wght-normal\.[\w-]+\.woff2$/.test(path))) refuse('unexpected font selection');
  for (const [path, bytes] of files) {
    const source = bytes.toString('utf8');
    inspectSecrets(source);
    if (path.endsWith('.woff2')) {
      if (bytes.toString('ascii', 0, 4) !== 'wOF2') refuse('invalid font file');
      continue;
    }
    if (path.startsWith('licenses/')) continue;
    if (/\u2014|&mdash;|&#0*8212;|&#x0*2014;|\\u2014|\\u\{2014\}/i.test(source)) refuse('forbidden punctuation in authored content');
    if (/sourceMappingURL|(?:fetch|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(|\/api\/enquir|enquiry-client|Local enquiry test\.|Synthetic (?:test|image)|Test patterns/.test(source)) refuse('network, test integration or fixture content');
    if (/\b(?:data\s*:\s*(?:image|audio|video)\/|blob\s*:)/i.test(source)) refuse('embedded media is not allowed');
    if (path.endsWith('.html')) inspectHtml(path, source, files);
    if (path.endsWith('.css')) inspectCss(source, path, files);
    if (path.endsWith('.svg') && /<(?:image|foreignObject|script|use)\b|\bon\w+\s*=|\b(?:href|src)\s*=/i.test(source)) refuse('active or referenced SVG content');
  }
  if (files.get('robots.txt').toString('utf8').trim() !== 'User-agent: *\nDisallow: /') refuse('robots must block indexing');
  if (/<loc\b/i.test(files.get('sitemap.xml').toString('utf8'))) refuse('placeholder review must not publish sitemap destinations');
  return files;
}

export function packageReview({ sourceDirectory, packageDirectory, metadata, zip = false }) {
  const source = resolve(sourceDirectory);
  const output = resolve(packageDirectory);
  if (basename(output) !== '.review-package' || basename(source) !== 'dist' || output === source || below(source, output) || below(output, source)) refuse('source and package directories must be separate');
  if (!existsSync(dirname(output)) || lstatSync(dirname(output)).isSymbolicLink() || (existsSync(output) && (!lstatSync(output).isDirectory() || lstatSync(output).isSymbolicLink()))) refuse('unsafe package directory');
  const canonicalSource = existsSync(source) ? realpathSync(source) : source;
  const canonicalOutput = join(realpathSync(dirname(output)), basename(output));
  if (canonicalSource === canonicalOutput || below(canonicalSource, canonicalOutput) || below(canonicalOutput, canonicalSource)) refuse('source and package directories overlap');
  // A failed validation must not leave an older package that looks current.
  rmSync(output, { recursive: true, force: true });
  try {
    if (!metadata || !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(metadata.sourceCommit ?? '') || !['clean', 'modified'].includes(metadata.sourceTree) || new Date(metadata.createdAt).toISOString() !== metadata.createdAt) refuse('invalid source stamp');
    const files = verifyReviewDist(source);
    const upload = join(output, 'upload');
    mkdirSync(upload, { recursive: true, mode: 0o700 });
    const inventory = [];
    for (const [path, bytes] of [...files, ['_headers', Buffer.from(reviewHeaders)]].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
      const destination = join(upload, path);
      mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
      writeFileSync(destination, bytes, { mode: 0o644 });
      chmodSync(destination, 0o644);
      utimesSync(destination, frozenTime, frozenTime);
      inventory.push({ path, bytes: bytes.length, sha256: digest(bytes) });
    }
    const manifest = {
      version: 1, kind: 'owner-review-placeholder', createdAt: metadata.createdAt,
      sourceCommit: metadata.sourceCommit, sourceTree: metadata.sourceTree,
      stampScope: 'checkout-at-packaging',
      sourceArtifactSha256: digest([...files].sort(([a], [b]) => a.localeCompare(b, 'en')).map(([path, bytes]) => `${path}\0${digest(bytes)}\n`).join('')),
      uploadArtifactSha256: digest(inventory.map(file => `${file.path}\0${file.sha256}\n`).join('')),
      files: inventory,
    };
    if (zip) {
      if (!existsSync('/usr/bin/zip')) refuse('system zip is unavailable; create the folder package instead');
      const archive = join(output, 'owner-review.zip');
      const result = spawnSync('/usr/bin/zip', ['-X', '-9', '-q', archive, '-@'], { cwd: upload, input: `${inventory.map(file => file.path).join('\n')}\n`, encoding: 'utf8', env: { PATH: '/usr/bin:/bin', LANG: 'C', TZ: 'UTC' }, timeout: 30_000 });
      if (result.status !== 0) refuse('zip creation failed');
      const bytes = readFileSync(archive);
      manifest.archive = { path: 'owner-review.zip', bytes: bytes.length, sha256: digest(bytes) };
    }
    writeFileSync(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
    return manifest;
  } catch (error) {
    rmSync(output, { recursive: true, force: true });
    if (error instanceof Error && error.message.startsWith('Review package refused:')) throw error;
    refuse('package could not be completed');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  try {
    if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--zip')) refuse('use no argument or --zip');
    if ((process.env.PUBLIC_SITE_MODE && process.env.PUBLIC_SITE_MODE !== 'review') || process.env.ENQUIRY_LOCAL_LAB || process.env.NETLIFY || process.env.CONTEXT) refuse('use an ordinary local review environment');
    const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 2 * 1024 * 1024 }).trim();
    const metadata = { createdAt: new Date().toISOString(), sourceCommit: git(['rev-parse', '--verify', 'HEAD']), sourceTree: git(['status', '--porcelain', '--untracked-files=normal']) ? 'modified' : 'clean' };
    const result = packageReview({ sourceDirectory: join(root, 'dist'), packageDirectory: join(root, '.review-package'), metadata, zip: process.argv[2] === '--zip' });
    console.log(`PASS: ${result.files.length} static review files packaged in .review-package/upload/.${result.archive ? ' ZIP: .review-package/owner-review.zip.' : ''} Hashes and source stamp remain outside the upload folder.`);
  } catch (error) {
    // The destination is fixed by this script, never by a CLI or environment
    // value. Refuse symlinks and preserve their unrelated targets.
    const output = join(root, '.review-package');
    if (existsSync(output) && lstatSync(output).isDirectory() && !lstatSync(output).isSymbolicLink()) rmSync(output, { recursive: true, force: true });
    console.error(error instanceof Error && error.message.startsWith('Review package refused:') ? error.message : 'Review package refused: required repository or source evidence is unavailable.');
    process.exitCode = 1;
  }
}
