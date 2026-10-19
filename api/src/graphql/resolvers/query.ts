import type { QueryResolvers } from '../../generated/graphql/resolvers-types.js';

export const Query: QueryResolvers = {
  motorcycles: (_parent, args, { services }) => services.motorcycles.search(args),
  motorcycle: (_parent, { slug }, { services }) => services.motorcycles.findBySlug(slug),
  compare: (_parent, { slugs }, { services }) => services.motorcycles.compare(slugs),
  brands: (_parent, _args, { services }) => services.catalog.listBrands(),
  categories: (_parent, _args, { services }) => services.catalog.listCategories(),
  exchangeRate: (_parent, _args, { services }) => services.prices.getExchangeRate(),
};
