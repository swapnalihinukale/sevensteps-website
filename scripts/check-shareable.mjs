import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';

// Scan the index independently of disk. A cleaned working copy must not hide a
// secret still staged for commit. Include unignored additions before staging.
// Report only file paths, snapshot sources and rule IDs, never matched values.
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ['aws-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['npm-token', /\bnpm_[A-Za-z0-9]{36,}\b/],
  ['credential-url', /\b(?:https?|postgres(?:ql)?|mongodb(?:\+srv)?):\/\/[^\s/@:'"<>]+:[^\s/@'"<>]{4,}@/],
];
const allowedEnvironment = new Set([
  'PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'DISPLAY', 'SYSTEMROOT',
  'MOZ_APP_DATA', 'MOZ_LOCAL_APP_DATA', 'REDACTED',
]);
const findings = [];
const files = new Set();
const scanned = { index: 0, working: 0, untracked: 0 };

function inspect(file, source, bytes) {
  files.add(file);
  scanned[source] += 1;
  if (/(?:^|\/)\.local\//.test(file) || /(?:^|\/)\.env(?!\.example$)/.test(file)) {
    findings.push({ file, source, rule: 'private-runtime-path' }); return;
  }
  if (bytes.includes(0)) return;
  const value = bytes.toString('utf8');
  for (const [rule, pattern] of rules) if (pattern.test(value)) findings.push({ file, source, rule });
  if (file.endsWith('.json')) {
    let document;
    try { document = JSON.parse(value); } catch { return; }
    const pending = [document];
    while (pending.length) {
      const entry = pending.pop();
      if (!entry || typeof entry !== 'object') return;
      for (const [key, content] of Object.entries(entry)) {
        if (key === 'env' && content !== null && (
          typeof content !== 'object' || Array.isArray(content) ||
          Object.keys(content).some(name => !allowedEnvironment.has(name))
        )) {
          findings.push({ file, source, rule: 'report-environment' });
        }
        if (content && typeof content === 'object') pending.push(content);
      }
    }
  }
}

let root;
function git(args, encoding = 'utf8') {
  return execFileSync('git', [...(root ? ['-C', root] : []), ...args], {
    encoding, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
  });
}

function inspectWorking(file, source) {
  const path = join(root, file);
  try {
    const stat = lstatSync(path);
    // Read the link itself, never an unrelated target outside the checkout.
    const bytes = stat.isSymbolicLink() ? Buffer.from(readlinkSync(path), 'utf8') : readFileSync(path);
    inspect(file, source, bytes);
  } catch (error) {
    // A deleted working file can still exist in the index and is scanned there.
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') findings.push({ file, source, rule: 'unreadable-file' });
  }
}

try {
  root = git(['rev-parse', '--show-toplevel']).trim();
  const entries = git(['ls-files', '--stage', '-z']).split('\0').filter(Boolean);
  const tracked = new Set();
  const blobs = new Map();
  for (const entry of entries) {
    const separator = entry.indexOf('\t');
    const [mode, object, stage] = entry.slice(0, separator).split(' ');
    const file = entry.slice(separator + 1);
    tracked.add(file);
    if (stage !== '0') findings.push({ file, source: 'index', rule: 'unmerged-index' });
    if (!['100644', '100755', '120000'].includes(mode)) {
      findings.push({ file, source: 'index', rule: 'unsupported-index-entry' });
      continue;
    }
    try {
      if (!blobs.has(object)) blobs.set(object, git(['cat-file', 'blob', object], null));
      inspect(file, 'index', blobs.get(object));
    } catch {
      findings.push({ file, source: 'index', rule: 'unreadable-index-blob' });
    }
  }
  for (const file of tracked) inspectWorking(file, 'working');
  for (const file of git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)) {
    inspectWorking(file, 'untracked');
  }
} catch {
  findings.push({ file: '.', source: 'repository', rule: 'git-snapshot-unavailable' });
}

console.log(JSON.stringify({ files: files.size, scanned, result: findings.length ? 'fail' : 'pass', findings }, null, 2));
process.exitCode = findings.length ? 1 : 0;
