import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'docs', 'audits');
const stamp = new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
const hash = (text) => createHash('sha256').update(text).digest('hex');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const lockPath = join(root, 'package-lock.json');
const lockText = readFileSync(lockPath, 'utf8');
const lockHash = hash(lockText);
const lock = JSON.parse(lockText);
const manifest = json(join(root, 'package.json'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
mkdirSync(output, { recursive: true });

function run(args) {
  return new Promise((done) => {
    const child = spawn(npm, args, { cwd: root, env: process.env, timeout: 60_000 });
    let stdout = '';
    let stderr = '';
    let error = null;
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (cause) => { error = cause.message; });
    child.on('close', (exitCode, signal) => done({ command: `npm ${args.join(' ')}`, exitCode, signal, stdout, stderr, error }));
  });
}

const packages = Object.entries(lock.packages ?? {}).filter(([path]) => path).map(([path, record]) => {
  const manifestPath = join(root, path, 'package.json');
  const installed = existsSync(manifestPath) ? json(manifestPath) : null;
  const scripts = Object.fromEntries(Object.entries(installed?.scripts ?? {}).filter(([key]) => ['preinstall', 'install', 'postinstall', 'prepare'].includes(key)));
  const licences = installed?.license ?? record.license ?? installed?.licenses ?? null;
  const license = typeof licences === 'string' ? licences : Array.isArray(licences) ? licences.map((entry) => entry.type ?? entry).join(' OR ') : licences?.type ?? null;
  return {
    path,
    name: installed?.name ?? record.name ?? path.slice(path.lastIndexOf('node_modules/') + 13),
    version: record.version,
    installedVersion: installed?.version ?? null,
    installed: Boolean(installed),
    devOnly: record.dev === true,
    optional: record.optional === true,
    os: record.os ?? null,
    cpu: record.cpu ?? null,
    resolved: record.resolved ?? null,
    integrity: record.integrity ?? null,
    engines: installed?.engines ?? record.engines ?? null,
    license,
    repository: installed?.repository ?? null,
    lifecycleScripts: scripts,
    lockHasInstallScript: record.hasInstallScript === true,
    licenceFiles: installed ? readdirSync(dirname(manifestPath)).filter((name) => /^(license|licence|copying|notice)(\.|$|-)/i.test(name)) : [],
  };
});

const direct = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies }).map(([name, requested]) => {
  const resolved = packages.find((entry) => entry.path === `node_modules/${name}`);
  return { name, requested, resolved: resolved?.version ?? null, exact: /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(requested), matches: resolved?.version === requested };
});

// Findings retain their location and pattern name, never the matched value.
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['npm-token', /\bnpm_[A-Za-z0-9]{36,}\b/g],
  ['credential-url', /\b(?:https?|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s/@:'"<>]+:[^\s/@'"<>]{4,}@/g],
];
const secretFindings = [];
const skipped = [];
let scannedFiles = 0;
const sourceRoots = ['src', 'server', 'netlify', 'public', 'content', 'scripts', 'tests', 'dist', 'dist-fixture', 'dist-integration'];
const candidates = [];
function collect(path) {
  if (!existsSync(path)) return;
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      collect(join(path, entry.name));
    }
  } else if (/\.(?:astro|[cm]?[jt]sx?|json|html|css|md|svg|map|txt)$/.test(path) || /(?:^|\/)\.env(?:\.|$)/.test(path)) {
    candidates.push(path);
  }
}
for (const folder of sourceRoots) collect(join(root, folder));
for (const entry of readdirSync(root, { withFileTypes: true })) if (entry.isFile()) collect(join(root, entry.name));
for (const path of [...new Set(candidates)].sort()) {
  if (statSync(path).size > 2 * 1024 * 1024) {
    skipped.push({ path: relative(root, path), reason: 'Text exceeds the 2 MiB scan limit; inspect separately.' });
    continue;
  }
  const text = readFileSync(path, 'utf8');
  scannedFiles += 1;
  for (const [rule, pattern] of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      secretFindings.push({ path: relative(root, path), line: text.slice(0, match.index).split('\n').length, rule });
    }
  }
}

const audits = await Promise.all([
  run(['audit', '--json', '--registry=https://registry.npmjs.org']),
  run(['audit', '--omit=dev', '--json', '--registry=https://registry.npmjs.org']),
]);
const auditSummaries = audits.map((audit, index) => {
  const scope = index === 0 ? 'full' : 'production';
  const filename = `${stamp}-npm-audit-${scope}.json`;
  let data = null;
  try { data = JSON.parse(audit.stdout); } catch { /* The failed scan stays explicit below. */ }
  writeFileSync(join(output, filename), `${JSON.stringify({ ...audit, stdout: undefined, data }, null, 2)}\n`);
  return {
    scope, file: filename, exitCode: audit.exitCode,
    healthy: data?.metadata?.vulnerabilities != null && !data?.error && [0, 1].includes(audit.exitCode),
    vulnerabilities: data?.metadata?.vulnerabilities ?? null,
    dependencies: data?.metadata?.dependencies ?? null,
  };
});

const licenseCounts = {};
for (const entry of packages) licenseCounts[entry.license ?? 'UNKNOWN'] = (licenseCounts[entry.license ?? 'UNKNOWN'] ?? 0) + 1;
const unresolved = {
  directPins: direct.filter((entry) => !entry.exact || !entry.matches),
  missingRequiredInstallations: packages.filter((entry) => !entry.installed && !entry.optional).map((entry) => entry.path),
  installedVersionMismatch: packages.filter((entry) => entry.installed && entry.version !== entry.installedVersion).map((entry) => entry.path),
  unknownLicenses: packages.filter((entry) => !entry.license).map((entry) => entry.path),
  missingRegistryIntegrity: packages.filter((entry) => !entry.integrity || !entry.resolved?.startsWith('https://registry.npmjs.org/')).map((entry) => entry.path),
  lockChangedDuringReport: hash(readFileSync(lockPath, 'utf8')) !== lockHash,
};
const report = {
  generatedAt: new Date().toISOString(), lockfileSha256: lockHash, lockfileVersion: lock.lockfileVersion,
  runtime: { node: process.version, platform: process.platform, architecture: process.arch, packageManager: manifest.packageManager },
  counts: { locked: packages.length, installed: packages.filter((entry) => entry.installed).length, devOnly: packages.filter((entry) => entry.devOnly).length, nonDev: packages.filter((entry) => !entry.devOnly).length, optionalNotInstalled: packages.filter((entry) => entry.optional && !entry.installed).length },
  audits: auditSummaries, direct, licenseCounts, unresolved,
  lifecycle: {
    packages: packages.filter((entry) => Object.keys(entry.lifecycleScripts).length || entry.lockHasInstallScript),
    note: 'Commands are inventoried, not executed. Prepare scripts in published registry packages describe package development/publishing and are not ordinary dependency install hooks. Git/local installs have different behavior. Review preinstall/install/postinstall and lock hasInstallScript flags before any rebuild.',
  },
  secrets: { scope: 'Site src, server, netlify, public, content, scripts, tests, all three built outputs when present, and root text/config files. Excludes node_modules, external workspace files and audit outputs.', scannedFiles, skipped, findings: secretFindings, limitation: 'A narrow pattern scan cannot prove the absence of all credentials or private information.' },
  packages,
};
const filename = `${stamp}-dependency-report.json`;
writeFileSync(join(output, filename), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: `docs/audits/${filename}`, counts: report.counts, audits: auditSummaries, licenseCounts, unresolved, secretFindings: secretFindings.length, secretFilesScanned: scannedFiles, lifecyclePackageCount: report.lifecycle.packages.length }, null, 2));
const auditNeedsReview = auditSummaries.some((audit) => !audit.healthy || (audit.vulnerabilities?.total ?? 1) > 0);
const inventoryNeedsReview = Object.values(unresolved).some((value) => Array.isArray(value) ? value.length > 0 : value);
if (auditNeedsReview || inventoryNeedsReview || secretFindings.length || skipped.length) process.exitCode = 1;
