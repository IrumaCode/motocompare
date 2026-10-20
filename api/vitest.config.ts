import { defineConfig } from 'vitest/config';

export default defineConfig({
  ssr: {
    resolve: {
      // graphql 17 ships a separate build for the "development" condition, which Vite picks by
      // default in tests. graphql-yoga is loaded by Node itself and gets the regular build, so
      // there would be two GraphQLError classes and `instanceof` checks would fail (the "dual
      // package hazard"). Resolving with Node's own conditions keeps a single copy, as in
      // production.
      conditions: ['module-sync', 'node', 'import'],
    },
  },
});
