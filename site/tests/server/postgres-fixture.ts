import { randomBytes, createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { PostgresEnquiryStore } from '../../server/postgres-store.ts';
import type { AcceptInput } from '../../server/contracts.ts';

export const testDatabaseUrl = process.env.SEVENSTEPS_TEST_DATABASE_URL;
export async function postgresFixture() {
  if (!testDatabaseUrl) throw new Error('Set SEVENSTEPS_TEST_DATABASE_URL to the isolated local test database.');
  const url = new URL(testDatabaseUrl);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !url.pathname.includes('test')) {
    throw new Error('PostgreSQL tests require a loopback database whose name contains test.');
  }
  const schema = `enquiry_test_${randomBytes(8).toString('hex')}`;
  const admin = new Pool({ connectionString: testDatabaseUrl, max: 1 });
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({ connectionString: testDatabaseUrl, max: 6, options: `-c search_path=${schema},public` });
  try {
    await pool.query(await readFile(new URL('../../server/migrations/001-enquiries.sql', import.meta.url), 'utf8'));
  } catch (error) {
    await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end(); throw error;
  }
  return {
    pool, store: new PostgresEnquiryStore(pool), schema,
    async clear() { await pool.query('TRUNCATE enquiry_receipts, enquiries, notification_outbox, notification_events, enquiry_rate_limits CASCADE'); },
    async close() { await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end(); },
  };
}

export function submission(now = Date.UTC(2026, 9, 15, 0, 0)): AcceptInput {
  const enquiry = { name: 'Test Couple', email: 'synthetic@example.test', when: 'Date not set', where: 'Test venue', message: 'Synthetic test enquiry.', story: 'wedding-story' as const };
  return { tokenId: randomUUID(), formVersion: 'enquiry-v1', enquiry, now,
    fingerprint: createHmac('sha256', 'synthetic-test-key').update(JSON.stringify(enquiry)).digest('hex'),
    notification: { from: 'draft@example.test', to: 'operator@example.test', subject: 'Enquiry test', text: 'Synthetic notification.', replyTo: enquiry.email } };
}
