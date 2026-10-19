import type { CodegenConfig } from '@graphql-codegen/cli';

// Generates resolver types from the SDL. Paths inside `mappers` and `contextType`
// are relative to the generated file.
const config: CodegenConfig = {
  schema: 'src/graphql/type-defs.ts',
  generates: {
    'src/generated/graphql/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useTypeImports: true,
        // GraphQL enums become string unions with the same values as the Prisma enums
        enumsAsTypes: true,
        // GraphQL fills in default values, so those fields are never missing at runtime
        avoidOptionals: { defaultValue: true },
        contextType: '../../graphql/context.js#GraphQLContext',
        // Resolvers receive Prisma models as parents; relations are resolved separately
        mappers: {
          Motorcycle: '../prisma/client.js#Motorcycle as MotorcycleModel',
          Brand: '../prisma/client.js#Brand as BrandModel',
          Category: '../prisma/client.js#Category as CategoryModel',
        },
        // Prisma ids are numbers; GraphQL serializes them as strings
        scalars: { ID: { input: 'string', output: 'string | number' } },
      },
    },
  },
};

export default config;
