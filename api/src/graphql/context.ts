import type { CatalogService } from '../services/catalog-service.js';
import type { MotorcycleService } from '../services/motorcycle-service.js';
import type { PriceService } from '../services/price-service.js';
import type { Loaders } from './loaders.js';

export interface Services {
  readonly motorcycles: MotorcycleService;
  readonly catalog: CatalogService;
  readonly prices: PriceService;
}

/** What every resolver receives: shared services plus per-request loaders. */
export interface GraphQLContext {
  readonly services: Services;
  readonly loaders: Loaders;
}
