import type { Brand, Category } from '../generated/prisma/client.js';
import type { CatalogRepository } from '../repositories/catalog-repository.js';

export interface CatalogService {
  listBrands(): Promise<Brand[]>;
  listCategories(): Promise<Category[]>;
}

export function createCatalogService(repository: CatalogRepository): CatalogService {
  return {
    listBrands: () => repository.findAllBrands(),
    listCategories: () => repository.findAllCategories(),
  };
}
