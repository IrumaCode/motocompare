import DataLoader from 'dataloader';
import type { Brand, Category } from '../generated/prisma/client.js';
import type { CatalogRepository } from '../repositories/catalog-repository.js';

export interface Loaders {
  brandById: DataLoader<number, Brand>;
  categoryById: DataLoader<number, Category>;
}

/**
 * Turns a "find by ids" query into a DataLoader batch function. DataLoader requires one result
 * per key, in the same order as the keys, so rows are re-indexed by id.
 */
function byIds<T extends { id: number }>(
  entity: string,
  findByIds: (ids: readonly number[]) => Promise<T[]>,
) {
  return async (ids: readonly number[]): Promise<(T | Error)[]> => {
    const rowsById = new Map((await findByIds(ids)).map((row) => [row.id, row]));
    return ids.map((id) => rowsById.get(id) ?? new Error(`${entity} ${String(id)} not found`));
  };
}

/**
 * Creates fresh loaders. Must be called once per request: each loader caches what it loads,
 * and that cache must not outlive the request.
 */
export function createLoaders(catalog: CatalogRepository): Loaders {
  return {
    brandById: new DataLoader(byIds('Brand', (ids) => catalog.findBrandsByIds(ids))),
    categoryById: new DataLoader(byIds('Category', (ids) => catalog.findCategoriesByIds(ids))),
  };
}
