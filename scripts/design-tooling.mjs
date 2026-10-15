#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tooling = path.join(root, '.design-tooling');
const repo = path.join(tooling, 'open-design');
const data = path.join(tooling, 'state/data');
const lifecycle = path.join(tooling, 'state/lifecycle');
const node = path.join(tooling, 'runtime/node_modules/node/bin/node');
const pnpm = path.join(tooling, 'runtime/node_modules/pnpm/bin/pnpm.cjs');
const cli = path.join(repo, 'apps/daemon/dist/cli.js');
const namespace = 'website-design';
const port = 47841;
const base = `http://127.0.0.1:${port}`;
const pin = 'ae8038e7ce12ff305d57d12acbf3001f117cb100';
const shared = ['--namespace', namespace, '--tools-dev-root', lifecycle, '--no-env-file'];
// Deliberately fail closed independently of ignored runtime state or env vars.
// Lift only after documented dependency remediation and targeted revalidation.
const SECURITY_HOLD = true;
const SECURITY_AUDIT = path.join(tooling, 'DEPENDENCY-AUDIT-2026-10-15.md');

function fail(message) { throw new Error(message); }
function prerequisites() {
  if (process.versions.node.split('.')[0] !== '24') fail('Use scripts/design-tooling.sh with task-local Node 24.');
  for (const file of [pnpm, cli, path.join(repo, 'tools/dev/dist/index.mjs')]) {
    if (!existsSync(file)) fail(`Missing build prerequisite: ${file}. See .design-tooling/README.md.`);
  }
  const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' });
  if (revision.status !== 0 || revision.stdout.trim() !== pin) fail('OpenDesign checkout does not match the audited commit.');
  if (process.env.OD_DATA_DIR !== data || process.env.OD_BIND_HOST !== '127.0.0.1' || process.env.OPEN_DESIGN_VELA_TELEMETRY !== '0') {
    fail('The isolated environment is missing. Use scripts/design-tooling.sh.');
  }
}
function prepareState() {
  mkdirSync(data, { recursive: true, mode: 0o700 });
  const configPath = path.join(data, 'app-config.json');
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
  const next = { ...config, agentId: 'codex', telemetry: { ...config.telemetry, metrics: false, content: false, artifactManifest: false } };
  if (JSON.stringify(config) !== JSON.stringify(next)) writeFileSync(configPath, JSON.stringify(next, null, 2) + '\n', { mode: 0o600 });
}
async function json(endpoint) {
  const response = await fetch(base + endpoint, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) fail(`${endpoint}: HTTP ${response.status}`);
  return response.json();
}
async function listening() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    let settled = false;
    const done = (value) => { if (!settled) { settled = true; socket.destroy(); resolve(value); } };
    socket.setTimeout(1500, () => done(true));
    socket.once('connect', () => done(true));
    socket.once('error', (error) => done(error.code !== 'ECONNREFUSED'));
  });
}
async function assertIdentity() {
  const info = await json('/api/mcp/install-info');
  if (info.env?.OD_DATA_DIR !== data || !info.args?.includes(cli) || realpathSync(info.command) !== realpathSync(node)) {
    fail(`Port ${port} belongs to a different service/runtime. It will not be reused or stopped.`);
  }
  await json('/api/health');
  return info;
}
function dev(command, extra = []) {
  // All lifecycle output goes to stderr, preserving MCP's stdout transport.
  return new Promise((resolve, reject) => {
    const child = spawn(node, [pnpm, 'tools-dev', command, 'daemon', ...shared, ...extra], { cwd: repo, stdio: ['ignore', 2, 2] });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`tools-dev ${command} failed (${signal || code}).`)));
  });
}
async function start() {
  prerequisites();
  if (await listening()) {
    await assertIdentity();
    return;
  }
  prepareState();
  await dev('start', ['--daemon-port', String(port)]);
  await assertIdentity();
}
async function stop() {
  prerequisites();
  if (await listening()) await assertIdentity();
  await dev('stop');
  if (await listening()) fail(`Port ${port} is still occupied after stop; no unrelated process was killed.`);
}
async function health() {
  await assertIdentity();
  const analytics = await json('/api/analytics/config');
  const config = await json('/api/app-config');
  const prefs = config.config ?? config;
  if (analytics.enabled !== false) fail('Analytics is not disabled.');
  if (prefs.telemetry?.metrics !== false || prefs.telemetry?.content !== false) fail('Telemetry preferences are not disabled.');
  return { health: 'ok', url: base, isolatedData: true, analyticsEnabled: false, metrics: false, content: false };
}
function codexServerConfig() {
  // This owned config deliberately uses only JSON-compatible TOML strings,
  // arrays and integers. Fail on unsupported edits instead of guessing.
  const text = readFileSync(path.join(root, '.codex/config.toml'), 'utf8');
  const block = text.split('[mcp_servers.open_design]')[1]?.split(/\n\s*\[/)[0];
  if (!block) fail('Project OpenDesign MCP configuration is missing.');
  const value = (key, pattern) => {
    const match = block.match(new RegExp(`^\\s*${key}\\s*=\\s*(${pattern})`, 'm'));
    if (!match) fail(`Unsupported or missing MCP configuration field: ${key}`);
    return JSON.parse(match[1]);
  };
  const server = {
    enabled: value('enabled', 'true|false'),
    command: value('command', '"(?:[^"\\\\]|\\\\.)*"'),
    args: value('args', '\\[[\\s\\S]*?\\]'),
    startup_timeout_sec: value('startup_timeout_sec', '\\d+'),
    tool_timeout_sec: value('tool_timeout_sec', '\\d+'),
    enabled_tools: value('enabled_tools', '\\[[\\s\\S]*?\\]'),
  };
  if (server.enabled !== true) fail(`OpenDesign MCP is disabled. See ${SECURITY_AUDIT}.`);
  if (server.command !== path.join(root, 'scripts/design-tooling.sh')) fail('Update the absolute launcher path in .codex/config.toml after moving the project.');
  if (JSON.stringify(server.args) !== '["mcp"]') fail('Unexpected MCP arguments.');
  const permitted = new Set(['list_skills', 'list_plugins', 'list_agents', 'list_projects', 'get_active_context', 'get_project', 'list_files', 'get_file', 'search_files', 'get_artifact', 'get_run']);
  if (!server.enabled_tools.length || !server.enabled_tools.every((tool) => permitted.has(tool))) fail('The research MCP configuration contains an unapproved tool.');
  return server;
}
function childExit(child) {
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.once('error', (error) => { console.error(error.message); process.exitCode = 1; });
  child.once('exit', (code) => { process.exitCode = code ?? 1; });
}

try {
  const command = process.argv[2] ?? 'help';
  if (SECURITY_HOLD && ['start', 'mcp', 'codex'].includes(command)) {
    fail(`Security hold: OpenDesign runtime is disabled pending dependency remediation and review. See ${SECURITY_AUDIT}. Offline skill/craft references remain usable; stop/status are available.`);
  }
  switch (command) {
    case 'start':
      await start();
      console.error(`OpenDesign is ready at ${base}.`);
      break;
    case 'stop':
      await stop();
      console.error('OpenDesign stopped.');
      break;
    case 'status':
      prerequisites();
      if (!(await listening())) console.log(JSON.stringify({ running: false, url: base }));
      else console.log(JSON.stringify({ running: true, ...await health() }, null, 2));
      break;
    case 'health':
      prerequisites();
      console.log(JSON.stringify(await health(), null, 2));
      break;
    case 'mcp': {
      await start();
      await health();
      const child = spawn(node, [cli, 'mcp', '--daemon-url', base], { cwd: repo, stdio: 'inherit' });
      childExit(child);
      break;
    }
    case 'codex': {
      // Explicit, per-process server settings avoid changing global trust,
      // global config, authentication, or unrelated project hooks/policies.
      const server = codexServerConfig();
      const inline = `{ ${Object.entries(server).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join(', ')} }`;
      childExit(spawn('codex', ['-c', `mcp_servers.open_design=${inline}`, ...process.argv.slice(3)], { cwd: root, stdio: 'inherit' }));
      break;
    }
    default:
      if (command !== 'help') fail(`Unknown command: ${command}`);
      console.log('Usage: scripts/design-tooling.sh start|stop|status|health|mcp|codex [Codex arguments]');
  }
} catch (error) {
  console.error(`OpenDesign setup: ${error.message}`);
  process.exitCode = 1;
}
