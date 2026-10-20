// In-memory stand-ins for the database and the exchange-rate source, shared by the API tests.
// They implement the same interfaces as the real ones, so services and the GraphQL app run
// unchanged on top of them (that is what the dependency injection in createApp is for).
import type {
  ExchangeRate,
  ExchangeRateProvider,
} from '../exchange-rate/exchange-rate-provider.js';
import type { Brand, Category, Motorcycle } from '../generated/prisma/client.js';
import type { CatalogRepository } from '../repositories/catalog-repository.js';
import type {
  MotorcycleQuery,
  MotorcycleRepository,
} from '../repositories/motorcycle-repository.js';

export const yamaha: Brand = { id: 1, name: 'Yamaha', slug: 'yamaha', country: 'Japón' };
export const honda: Brand = { id: 2, name: 'Honda', slug: 'honda', country: 'Japón' };
export const naked: Category = { id: 1, name: 'Naked', slug: 'naked' };

/** A complete, valid motorcycle (a Yamaha MT-07); tests override only what they care about. */
export function motorcycleFixture(overrides: Partial<Motorcycle> = {}): Motorcycle {
  return {
    id: 1,
    slug: 'yamaha-mt-07-2024',
    name: 'MT-07',
    year: 2024,
    brandId: yamaha.id,
    categoryId: naked.id,
    priceUsd: 8199,
    displacementCc: 689,
    engineType: 'PARALLEL_TWIN',
    cooling: 'LIQUID',
    powerHp: 72.4,
    powerRpm: 8750,
    torqueNm: 67,
    torqueRpm: 6500,
    transmission: 'MANUAL',
    gears: 6,
    weightKg: 184,
    seatHeightMm: 805,
    fuelCapacityL: 14,
    imagePath: '/motos/yamaha-mt-07-2024.webp',
    imageAuthor: 'Jane Doe',
    imageLicense: 'CC BY-SA 4.0',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface FakeMotorcycleRepository extends MotorcycleRepository {
  /** Every query received by findMany, to check what the service asked for. */
  readonly queries: MotorcycleQuery[];
}

/** Paging works; filters and sorting do not (those are Prisma's job, see the .int tests). */
export function createFakeMotorcycleRepository(
  motorcycles: readonly Motorcycle[],
): FakeMotorcycleRepository {
  const queries: MotorcycleQuery[] = [];
  return {
    queries,
    findMany(query) {
      queries.push(query);
      const items = motorcycles.slice(query.skip, query.skip + query.take);
      return Promise.resolve({ items, totalCount: motorcycles.length });
    },
    findBySlug(slug) {
      return Promise.resolve(motorcycles.find((motorcycle) => motorcycle.slug === slug) ?? null);
    },
    findBySlugs(slugs) {
      // Like SQL "IN": catalog order, not the requested order
      return Promise.resolve(motorcycles.filter((motorcycle) => slugs.includes(motorcycle.slug)));
    },
    listPowerHp() {
      return Promise.resolve(motorcycles.map((motorcycle) => motorcycle.powerHp));
    },
  };
}

export interface FakeCatalogRepository extends CatalogRepository {
  /** How many times brands were fetched by id (DataLoader should batch them into one). */
  readonly brandLookups: (readonly number[])[];
}

export function createFakeCatalogRepository(
  brands: readonly Brand[] = [yamaha, honda],
  categories: readonly Category[] = [naked],
): FakeCatalogRepository {
  const brandLookups: (readonly number[])[] = [];
  return {
    brandLookups,
    findAllBrands: () => Promise.resolve([...brands]),
    findBrandsByIds(ids) {
      brandLookups.push(ids);
      return Promise.resolve(brands.filter((brand) => ids.includes(brand.id)));
    },
    findAllCategories: () => Promise.resolve([...categories]),
    findCategoriesByIds: (ids) =>
      Promise.resolve(categories.filter((category) => ids.includes(category.id))),
  };
}

export const RATE: ExchangeRate = {
  copPerUsd: 4000,
  validFrom: '2026-10-20',
  source: 'test',
};

/** Always answers with `rate`, or always fails when given an Error. */
export function fakeExchangeRateProvider(rate: ExchangeRate | Error = RATE): ExchangeRateProvider {
  return {
    getUsdToCop: () => (rate instanceof Error ? Promise.reject(rate) : Promise.resolve(rate)),
  };
}
