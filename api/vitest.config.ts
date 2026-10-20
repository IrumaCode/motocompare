import { configDefaults, defineConfig } from 'vitest/config';

const INTEGRATION_TESTS = 'src/**/*.int.test.ts';

export default defineConfig({
  ssr: {
    resolve: {
      // graphql 17 ships a separate build for the "development" condition, which Vite picks by
      // default in tests. graphql-yoga is loaded by Node itself and gets the regular build, so
      // there would be two GraphQLError classes and `instanceof` checks would fail (the "dual
      // package hazard"). Resolving with Node's own conditions keeps a single copy, as in
      // production.
      conditions: ['module-sync', 'node'],
    },
  },
  test: {
    projects: [
      {
        // Fast and self-contained (in-memory fakes): `pnpm test`
        extends: true,
        test: {
          name: 'unit',
          exclude: [...configDefaults.exclude, INTEGRATION_TESTS],
        },
      },
      {
        // Against a real PostgreSQL (Docker): `pnpm test:db`
        extends: true,
        test: {
          name: 'integration',
          include: [INTEGRATION_TESTS],
          globalSetup: ['src/test/integration-setup.ts'],
          // Every file empties the same tables: run them one at a time, never in parallel
          fileParallelism: false,
        },
      },
    ],
  },
});
