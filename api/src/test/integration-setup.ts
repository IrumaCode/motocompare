import { execSync } from 'node:child_process';
import { testDatabaseUrl } from './test-database.js';

/**
 * Vitest global setup for the integration project: runs once before all .int tests and applies
 * any pending migration to the test database (Prisma creates it if missing). `migrate deploy`
 * never deletes anything: each test file empties the tables it uses (TRUNCATE) instead. A
 * broken migration fails here, before any test.
 */
export default function setup(): void {
  execSync('pnpm exec prisma migrate deploy', {
    // Prisma reads DATABASE_URL (prisma.config.ts): point it at the test database for this
    // command only. Passing env here works the same on Windows, macOS and Linux.
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: 'inherit',
  });
}
