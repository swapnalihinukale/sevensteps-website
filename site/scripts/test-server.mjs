import { readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { startLocalPostgres } from './local-postgres.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let cluster; let child; let interrupted = 0;
const signal = name => {
  interrupted = name === 'SIGINT' ? 130 : 143;
  child?.kill(name);
};
const onInterrupt = () => signal('SIGINT');
const onTerminate = () => signal('SIGTERM');
process.on('SIGINT', onInterrupt); process.on('SIGTERM', onTerminate);

try {
  // Always create a new database, even when the caller supplies another URL.
  cluster = await startLocalPostgres();
  console.log(`${cluster.version}: isolated loopback test database ready.`);
  if (!interrupted) {
    const tests = (await readdir(join(root, 'tests', 'server'))).filter(name => name.endsWith('.test.ts')).sort();
    if (!tests.length) throw new Error('No server tests found.');
    if (interrupted) throw new Error('Server tests interrupted before execution.');
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (key.startsWith('PG') || key.startsWith('ENQUIRY_') || key.startsWith('RESEND_') || /DATABASE_URL|NETLIFY_DB_URL/.test(key)) delete env[key];
    }
    Object.assign(env, { NODE_ENV: 'test', CONTEXT: 'test', ENQUIRY_MODE: 'disabled',
      SEVENSTEPS_TEST_DATABASE_URL: cluster.url });
    const exitCode = await new Promise((resolveExit, reject) => {
      child = spawn(process.execPath, ['--test', '--test-timeout=30000', ...tests.map(name => join('tests', 'server', name))],
        { cwd: root, env, stdio: 'inherit' });
      child.once('error', reject);
      child.once('close', (code, receivedSignal) => resolveExit(code ?? (receivedSignal === 'SIGINT' ? 130 : 1)));
    });
    process.exitCode = interrupted || exitCode;
  } else process.exitCode = interrupted;
} catch (error) {
  console.error(error.message);
  process.exitCode = interrupted || 1;
} finally {
  try { if (cluster) { await cluster.stop(); console.log('Isolated PostgreSQL test cluster stopped and removed.'); } }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  process.removeListener('SIGINT', onInterrupt); process.removeListener('SIGTERM', onTerminate);
}
