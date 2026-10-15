import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scanner = fileURLToPath(new URL('./check-shareable.mjs', import.meta.url));
// Construct a synthetic token shape without embedding one in this source.
const syntheticToken = ['ghp', '_'].join('') + 'A'.repeat(36);

function repository(t) {
  const directory = mkdtempSync(join(tmpdir(), 'seven-steps-shareable-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', directory, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '--quiet', '--initial-branch=shareable-test');
  const write = (file, value) => {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    writeFileSync(join(directory, file), value);
  };
  const check = () => {
    const result = spawnSync(process.execPath, [scanner], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.stderr, '');
    assert.ok(!result.stdout.includes(syntheticToken), 'Never print matched credential values.');
    assert.ok(result.status === 0 || result.status === 1, result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(result.status, report.result === 'pass' ? 0 : 1);
    return report;
  };
  return { directory, git, write, check };
}

test('finds a staged secret even when its working copy has been cleaned', (t) => {
  const repo = repository(t);
  repo.write('configuration.txt', syntheticToken);
  repo.git('add', 'configuration.txt');
  repo.write('configuration.txt', 'Clean working copy.');
  const report = repo.check();
  assert.equal(report.result, 'fail');
  assert.deepEqual(report.findings, [{ file: 'configuration.txt', source: 'index', rule: 'github-token' }]);
});

test('finds secrets in modified tracked files as well as untracked additions', (t) => {
  const repo = repository(t);
  repo.write('tracked.txt', 'Clean staged version.');
  repo.git('add', 'tracked.txt');
  repo.write('tracked.txt', syntheticToken);
  repo.write('new file.txt', syntheticToken);
  const report = repo.check();
  assert.equal(report.result, 'fail');
  assert.ok(report.findings.some((item) => item.file === 'tracked.txt' && item.source === 'working'));
  assert.ok(report.findings.some((item) => item.file === 'new file.txt' && item.source === 'untracked'));
  assert.deepEqual(report.scanned, { index: 1, working: 1, untracked: 1 });
});

test('rejects every unknown serialized environment name, including enquiry keys', (t) => {
  const repo = repository(t);
  for (const key of ['ENQUIRY_RATE_KEY', 'ENQUIRY_FINGERPRINT_KEY', 'AUTHORIZATION', 'UNKNOWN']) {
    repo.write('report.json', JSON.stringify({ results: [{ config: { env: { [key]: 'synthetic-value' } } }] }));
    const report = repo.check();
    assert.equal(report.result, 'fail', key);
    assert.ok(report.findings.some((item) => item.rule === 'report-environment'));
    assert.ok(!JSON.stringify(report).includes('synthetic-value'));
  }
});

test('permits the explicit browser environment allowlist and redacted reports', (t) => {
  const repo = repository(t);
  const allowed = ['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'DISPLAY', 'SYSTEMROOT', 'MOZ_APP_DATA', 'MOZ_LOCAL_APP_DATA'];
  repo.write('report.json', JSON.stringify({ config: { env: Object.fromEntries(allowed.map((key) => [key, 'safe-test-value'])) } }));
  repo.write('redacted.json', JSON.stringify({ config: { env: { REDACTED: 'Removed. Test outcomes are unchanged.' } } }));
  repo.write('fixture.test.ts', "const fixture = { env: { ENQUIRY_RATE_KEY: 'synthetic-value' } };\n");
  repo.git('add', '.');
  const report = repo.check();
  assert.equal(report.result, 'pass');
  assert.deepEqual(report.findings, []);
});

test('ignores deleted working files while still scanning their staged blobs', (t) => {
  const repo = repository(t);
  repo.write('deleted-clean.txt', 'Clean content.');
  repo.git('add', 'deleted-clean.txt');
  unlinkSync(join(repo.directory, 'deleted-clean.txt'));
  assert.equal(repo.check().result, 'pass');
  repo.write('deleted-secret.txt', syntheticToken);
  repo.git('add', 'deleted-secret.txt');
  unlinkSync(join(repo.directory, 'deleted-secret.txt'));
  const report = repo.check();
  assert.deepEqual(report.findings, [{ file: 'deleted-secret.txt', source: 'index', rule: 'github-token' }]);
});

test('does not decode binary blobs or scan ignored untracked output', (t) => {
  const repo = repository(t);
  repo.write('sample.bin', Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(syntheticToken)]));
  repo.write('.gitignore', 'ignored-output/\n');
  repo.git('add', 'sample.bin', '.gitignore');
  repo.write('ignored-output/report.txt', syntheticToken);
  assert.equal(repo.check().result, 'pass');
});

test('private runtime paths are rejected but a blank env example is allowed', (t) => {
  const repo = repository(t);
  repo.write('.env.example', 'ENQUIRY_RATE_KEY=\n');
  assert.equal(repo.check().result, 'pass');
  repo.write('.local/settings.json', '{}');
  repo.write('.env.local', 'SYNTHETIC=example');
  repo.git('add', '.local/settings.json', '.env.local');
  const report = repo.check();
  assert.equal(report.result, 'fail');
  assert.ok(report.findings.every((item) => item.rule === 'private-runtime-path'));
});

test('a serialized environment must be an object or null, not an opaque value', (t) => {
  const repo = repository(t);
  for (const env of ['opaque-value', ['value'], 42]) {
    repo.write('report.json', JSON.stringify({ env }));
    assert.equal(repo.check().result, 'fail');
  }
  repo.write('report.json', JSON.stringify({ env: null }));
  assert.equal(repo.check().result, 'pass');
});
