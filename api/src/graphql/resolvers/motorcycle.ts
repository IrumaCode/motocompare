import type { MotorcycleResolvers } from '../../generated/graphql/resolvers-types.js';

// Scalar fields come straight from the Prisma model; only derived and related fields need code
export const Motorcycle: MotorcycleResolvers = {
  brand: (motorcycle, _args, { loaders }) => loaders.brandById.load(motorcycle.brandId),
  category: (motorcycle, _args, { loaders }) => loaders.categoryById.load(motorcycle.categoryId),
  priceCop: (motorcycle, _args, { services }) => services.prices.toCop(motorcycle.priceUsd),
};
