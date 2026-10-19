import type { CodegenConfig } from '@graphql-codegen/cli';

// Reads the API schema straight from its SDL file, so no running server is needed (also in CI)
const config: CodegenConfig = {
  schema: '../api/src/graphql/type-defs.ts',
  documents: ['src/**/*.{ts,tsx}', '!src/generated/**'],
  ignoreNoDocuments: true,
  generates: {
    'src/generated/graphql/': {
      preset: 'client',
      // Fragments stay colocated with components but their fields are not hidden from parents
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: { ID: 'string' },
      },
    },
  },
};

export default config;
