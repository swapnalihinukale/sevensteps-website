import { constants } from 'node:fs';
import { access, appendFile, chmod, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';

const execute = promisify(execFile);
const programs = ['initdb', 'postgres', 'pg_ctl', 'createdb'];

function localEnvironment() {
  const env = { ...process.env };
  // libpq must not read inherited connection, service or password settings.
  for (const key of Object.keys(env)) if (key.startsWith('PG')) delete env[key];
  return env;
}

async function findBinaries() {
  const candidates = [process.env.SEVENSTEPS_PG_BIN, '/opt/homebrew/opt/postgresql@16/bin',
    ...(process.env.PATH ?? '').split(delimiter)].filter(Boolean);
  for (const directory of [...new Set(candidates)]) {
    try {
      await Promise.all(programs.map(name => access(join(directory, name), constants.X_OK)));
      const { stdout } = await execute(join(directory, 'postgres'), ['--version'], { env: localEnvironment(), timeout: 5_000 });
      const major = Number(stdout.match(/PostgreSQL\) (\d+)/)?.[1]);
      if (major >= 16) return { directory, version: stdout.trim() };
    } catch { /* Continue to the next installed binary directory. */ }
  }
  throw new Error('Native PostgreSQL 16 or newer is required. Install it or set SEVENSTEPS_PG_BIN to its bin directory. Database tests cannot be skipped.');
}

async function freeLoopbackPort() {
  const server = createServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen({ host: '127.0.0.1', port: 0, exclusive: true }, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

/** Start only a new synthetic loopback cluster; never reuse a supplied URL. */
export async function startLocalPostgres({ database = 'sevensteps_test' } = {}) {
  if (!/^sevensteps_(?:test|lab)(?:_[a-z0-9]+)*$/.test(database)) throw new Error('Use a sevensteps_test or sevensteps_lab database name.');
  const binaries = await findBinaries();
  // A short socket path avoids macOS Unix-domain socket length limits.
  const directory = await mkdtemp('/tmp/sevensteps-pg-');
  await chmod(directory, 0o700);
  const data = join(directory, 'data'); const socket = join(directory, 'socket');
  const env = localEnvironment();
  await mkdir(socket, { mode: 0o700 });
  let initialized = false; let stopped = false; let stopping;
  const command = (name, args, timeout = 30_000) => execute(join(binaries.directory, name), args,
    { env, timeout, maxBuffer: 1024 * 1024 });
  async function stop() {
    if (stopped) return;
    if (stopping) return stopping;
    stopping = (async () => {
      if (initialized) {
        let running;
        try { await command('pg_ctl', ['-D', data, 'status']); running = true; }
        catch (error) {
          if (error.code === 3 || error.code === 4) running = false;
          else throw new Error(`Cannot establish local PostgreSQL state; retained ${directory}.`, { cause: error });
        }
        if (running) {
          // Fast shutdown aborts only this synthetic cluster's open transactions.
          // pg_ctl waits for the server to exit before its own directory is removed.
          try { await command('pg_ctl', ['-D', data, 'stop', '-m', 'fast', '-w', '-t', '20']); }
          catch (error) { throw new Error(`Local PostgreSQL did not stop; retained ${directory}.`, { cause: error }); }
        }
      }
      await rm(directory, { recursive: true, force: true });
      stopped = true;
    })();
    try { await stopping; } finally { if (!stopped) stopping = undefined; }
  }
  try {
    await command('initdb', ['-D', data, '-U', 'sevensteps_test', '--auth-local=trust', '--auth-host=trust', '--no-locale', '--encoding=UTF8']);
    initialized = true;
    const port = await freeLoopbackPort();
    await appendFile(join(data, 'postgresql.conf'), [
      '', "listen_addresses = '127.0.0.1'", `port = ${port}`, `unix_socket_directories = '${socket}'`,
      'max_connections = 24', "shared_buffers = '16MB'", "log_min_messages = 'warning'",
      "log_statement = 'none'", 'fsync = on', 'synchronous_commit = on', '',
    ].join('\n'));
    await command('pg_ctl', ['-D', data, '-l', join(directory, 'postgres.log'), 'start', '-w', '-t', '20']);
    await command('createdb', ['--host=127.0.0.1', `--port=${port}`, '--username=sevensteps_test', '--maintenance-db=postgres', database]);
    return { url: `postgresql://sevensteps_test@127.0.0.1:${port}/${database}`, version: binaries.version, stop };
  } catch (error) {
    try { await stop(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Local PostgreSQL startup and cleanup failed.'); }
    throw error;
  }
}
