import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function checkPublicArtifact(directory, mode) {
  if (!['fixture', 'public'].includes(mode)) throw new Error('Use fixture or public mode.');
  const failures = [];
  const files = [];
  function walk(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, item.name);
      if (item.isSymbolicLink()) failures.push('Artifact contains a symbolic link.');
      else if (item.isDirectory()) walk(path);
      else files.push(path);
    }
  }
  walk(directory);
  const pages = files.filter(path => path.endsWith('.html'));
  if (!existsSync(join(directory, 'index.html')) || pages.length < 4) failures.push('Expected homepage, at least two stories and error page.');
  if (!existsSync(join(directory, 'sitemap.xml')) || !existsSync(join(directory, 'robots.txt'))) failures.push('Missing search discovery files.');
  for (const path of files) {
    const name = path.slice(directory.length);
    if (/content-checklist|\.map$|\.env|(?:^|\/)\.local\/|fixture-masters|release-approval|public\.json|media-(?:public|fixture)\.json/.test(name)) failures.push(`Private or source file in artifact: ${name}`);
    if (!/\.(?:html|js|json|xml|txt|css)$/.test(path)) continue;
    const source = readFileSync(path, 'utf8');
    if (/\.local\/media-masters|\.generated\/|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(source)) failures.push(`Private source reference in ${name}`);
    if (!path.endsWith('.html')) continue;
    if (/data-content-note|data-slot-item|href="[^"\s]*content-checklist|Website draft\.|Private review\.|Photograph to add|Sending is not set up/.test(source)) failures.push(`Review content leaked into ${name}`);
    if (mode === 'fixture' && !/<meta\s+name="robots"\s+content="[^"]*noindex/.test(source)) failures.push(`Fixture indexing is not blocked in ${name}`);
    if (mode === 'public' && /example\.invalid|Synthetic (?:image|content|test)|Test patterns|data-enquiry-active-form/.test(source)) failures.push(`Test content leaked into ${name}`);
  }
  if (mode === 'fixture' && existsSync(join(directory, 'robots.txt')) && !/Disallow:\s*\//.test(readFileSync(join(directory, 'robots.txt'), 'utf8'))) failures.push('Fixture crawler rule must disallow access.');
  return { mode, files: files.length, pages: pages.length, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mode = process.argv[2];
  try {
    const result = checkPublicArtifact(resolve(mode === 'fixture' ? 'dist-fixture' : 'dist'), mode);
    if (result.failures.length) { console.error(result.failures.join('\n')); process.exitCode = 1; }
    else console.log(`PASS: ${mode} artifact, ${result.pages} pages and ${result.files} files, no review/source leakage.`);
  } catch (error) { console.error(`Artifact check failed: ${error.message}`); process.exitCode = 1; }
}
