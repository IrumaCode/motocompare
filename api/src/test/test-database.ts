import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT_ENV_FILE = resolve(import.meta.dirname, '../../../.env');

/**
 * Connection string of the database the integration tests may wipe. Read from TEST_DATABASE_URL
 * (the root .env locally, a CI variable in GitHub Actions). Refuses anything that does not look
 * like a test database, because every run deletes all of its data.
 */
export function testDatabaseUrl(): string {
  if (existsSync(ROOT_ENV_FILE)) {
    // Variables already set (e.g. by CI) win over the file
    process.loadEnvFile(ROOT_ENV_FILE);
  }
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set (see .env.example)');
  }
  const databaseName = new URL(url).pathname.slice(1);
  if (!databaseName.endsWith('_test') || url === process.env.DATABASE_URL) {
    throw new Error(
      `Refusing to run integration tests on "${databaseName}": its name must end in "_test"`,
    );
  }
  return url;
}
