import type { Brand, Category, PrismaClient } from '../generated/prisma/client.js';

/** Reference data that classifies motorcycles: brands and categories. */
export interface CatalogRepository {
  findAllBrands(): Promise<Brand[]>;
  findBrandsByIds(ids: readonly number[]): Promise<Brand[]>;
  findAllCategories(): Promise<Category[]>;
  findCategoriesByIds(ids: readonly number[]): Promise<Category[]>;
}

export function createCatalogRepository(prisma: PrismaClient): CatalogRepository {
  return {
    findAllBrands() {
      return prisma.brand.findMany({ orderBy: { name: 'asc' } });
    },

    findBrandsByIds(ids) {
      return prisma.brand.findMany({ where: { id: { in: [...ids] } } });
    },

    findAllCategories() {
      return prisma.category.findMany({ orderBy: { name: 'asc' } });
    },

    findCategoriesByIds(ids) {
      return prisma.category.findMany({ where: { id: { in: [...ids] } } });
    },
  };
}
