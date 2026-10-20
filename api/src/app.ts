import {
  createGraphQLError,
  createSchema,
  createYoga,
  maskError,
  type YogaServerInstance,
} from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import { InputError } from './errors.js';
import { withCache } from './exchange-rate/cached-provider.js';
import type { ExchangeRateProvider } from './exchange-rate/exchange-rate-provider.js';
import { createTrmProvider } from './exchange-rate/trm-provider.js';
import type { PrismaClient } from './generated/prisma/client.js';
import type { GraphQLContext, Services } from './graphql/context.js';
import { createLoaders } from './graphql/loaders.js';
import { resolvers } from './graphql/resolvers/index.js';
import { typeDefs } from './graphql/type-defs.js';
import {
  createCatalogRepository,
  type CatalogRepository,
} from './repositories/catalog-repository.js';
import {
  createMotorcycleRepository,
  type MotorcycleRepository,
} from './repositories/motorcycle-repository.js';
import { createCatalogService } from './services/catalog-service.js';
import { createMotorcycleService } from './services/motorcycle-service.js';
import { createPriceService } from './services/price-service.js';

const EXCHANGE_RATE_TTL_MS = 6 * 60 * 60 * 1000;
const EXCHANGE_RATE_RETRY_DELAY_MS = 60 * 1000;

/** Everything the app talks to outside itself. Tests pass in-memory fakes instead. */
export interface AppDependencies {
  readonly motorcycleRepository: MotorcycleRepository;
  readonly catalogRepository: CatalogRepository;
  readonly exchangeRateProvider: ExchangeRateProvider;
}

/** The real dependencies: PostgreSQL through Prisma and the official TRM, cached. */
export function createAppDependencies(prisma: PrismaClient): AppDependencies {
  return {
    motorcycleRepository: createMotorcycleRepository(prisma),
    catalogRepository: createCatalogRepository(prisma),
    exchangeRateProvider: withCache(createTrmProvider(), {
      ttlMs: EXCHANGE_RATE_TTL_MS,
      retryDelayMs: EXCHANGE_RATE_RETRY_DELAY_MS,
    }),
  };
}

/** Shows InputError messages to clients; any other error keeps Yoga's default masking. */
function exposeInputErrors(error: unknown, message: string, isDev?: boolean): Error {
  const cause = error instanceof GraphQLError ? error.cause : error;
  if (cause instanceof InputError) {
    return createGraphQLError(cause.message, { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return maskError(error, message, isDev);
}

/**
 * Builds the GraphQL app. It only depends on the Fetch API, so the same instance can be served
 * by Node (see server.ts) or by a serverless runtime.
 */
export function createApp({
  motorcycleRepository,
  catalogRepository,
  exchangeRateProvider,
}: AppDependencies): YogaServerInstance<object, GraphQLContext> {
  const services: Services = {
    motorcycles: createMotorcycleService(motorcycleRepository),
    catalog: createCatalogService(catalogRepository),
    prices: createPriceService(exchangeRateProvider),
  };

  return createYoga<object, GraphQLContext>({
    schema: createSchema<GraphQLContext>({ typeDefs, resolvers }),
    context: () => ({
      services,
      loaders: createLoaders({ catalog: catalogRepository, motorcycles: services.motorcycles }),
    }),
    maskedErrors: { maskError: exposeInputErrors },
  });
}
