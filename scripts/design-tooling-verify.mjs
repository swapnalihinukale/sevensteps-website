#!/usr/bin/env node
// Protocol/lifecycle verification only. This never submits an agent prompt.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const launcher = path.join(root, 'scripts/design-tooling.sh');
const pending = new Map();
const child = spawn(launcher, ['mcp'], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
let buffer = '';
let protocolLines = 0;
let diagnosticBytes = 0;
child.stderr.on('data', (data) => { diagnosticBytes += data.length; });
const rejectPending = (error) => {
  for (const job of pending.values()) { clearTimeout(job.timeout); job.reject(error); }
  pending.clear();
};
child.once('error', rejectPending);
child.once('exit', (code) => { if (pending.size) rejectPending(new Error(`MCP closed before responding (${code}).`)); });
child.stdout.on('data', (data) => {
  buffer += data.toString();
  for (;;) {
    const end = buffer.indexOf('\n');
    if (end < 0) break;
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    if (!line.trim()) continue;
    let message;
    try { message = JSON.parse(line); }
    catch { rejectPending(new Error('MCP stdout contained non-protocol output.')); return; }
    protocolLines++;
    const job = pending.get(message.id);
    if (!job) continue;
    pending.delete(message.id);
    clearTimeout(job.timeout);
    if (message.error) job.reject(new Error(JSON.stringify(message.error)));
    else job.resolve(message.result);
  }
});
let nextId = 0;
function request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 90000);
    pending.set(id, { resolve, reject, timeout });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}
function lifecycle(command) {
  const result = spawnSync(launcher, [command], { cwd: root, encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  return result.stdout.trim();
}
try {
  const init = await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'local-design-read-check', version: '1.0.0' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const catalog = await request('tools/list');
  const names = catalog.tools.map((tool) => tool.name);
  const config = readFileSync(path.join(root, '.codex/config.toml'), 'utf8');
  const allowlist = JSON.parse(config.match(/enabled_tools\s*=\s*(\[[\s\S]*?\])/)[1]);
  assert(allowlist.every((name) => names.includes(name)), 'Configured tool is absent upstream.');
  assert(!allowlist.some((name) => /^(start_|create_|write_|delete_|cancel_|collect_|confirm_)/.test(name)), 'Mutation/generation tool enabled.');
  const skills = await request('tools/call', { name: 'list_skills', arguments: {} });
  assert.notEqual(skills.isError, true, 'Skill discovery failed.');
  const skillText = skills.content.filter((item) => item.type === 'text').map((item) => item.text).join('\n');
  assert(skillText.length > 100, 'Skill catalog unexpectedly empty.');
  const resources = await request('resources/list');
  assert(resources.resources.length > 0, 'Resource catalog empty.');
  const health = JSON.parse(lifecycle('health'));
  const listener = () => spawnSync('lsof', ['-t', '-iTCP:47841', '-sTCP:LISTEN'], { encoding: 'utf8' }).stdout.trim();
  const before = listener();
  assert(before, 'Daemon listener was not found.');
  lifecycle('start'); // The existing service must be reused safely.
  assert.equal(listener(), before, 'Repeated start replaced the running service.');
  const report = {
    checkedAt: new Date().toISOString(),
    node: process.versions.node,
    health,
    mcp: {
      initialize: 'passed', server: init.serverInfo,
      upstreamToolCount: names.length,
      enabledReadTools: allowlist,
      listSkills: 'passed', skillCatalogCharacters: skillText.length,
      resourceCount: resources.resources.length,
      stdoutProtocolOnly: true, protocolLines, startupDiagnosticBytes: diagnosticBytes,
    },
    lifecycle: { automaticStart: 'passed', idempotentStart: 'passed' },
    modelRuns: 0, projectsCreated: 0, websiteCodeGenerated: false,
  };
  writeFileSync(path.join(root, '.design-tooling/VERIFICATION.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally {
  for (const job of pending.values()) clearTimeout(job.timeout);
  child.stdin.end();
  child.kill('SIGTERM');
  // Daemon lifetime is deliberate; the caller uses `design-tooling.sh stop`.
}
