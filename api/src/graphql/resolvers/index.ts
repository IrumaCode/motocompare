import type { Resolvers } from '../../generated/graphql/resolvers-types.js';
import { Motorcycle } from './motorcycle.js';
import { Query } from './query.js';

export const resolvers: Resolvers = { Query, Motorcycle };
