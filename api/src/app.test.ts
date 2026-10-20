import { describe, expect, it } from 'vitest';
import { createApp, type AppDependencies } from './app.js';
import type { Motorcycle } from './generated/prisma/client.js';
import {
  createFakeCatalogRepository,
  createFakeMotorcycleRepository,
  fakeExchangeRateProvider,
  honda,
  motorcycleFixture,
  type FakeCatalogRepository,
} from './test/fakes.js';

// Black-box tests: real schema, resolvers, services, loaders and error masking, driven through
// yoga.fetch (no HTTP server). Only the database and the TRM source are fakes.

interface GraphQLResponse<TData> {
  data?: TData | null;
  errors?: { message: string; extensions?: { code?: string } }[];
}

const mt07 = motorcycleFixture();
const cb650r = motorcycleFixture({
  id: 2,
  slug: 'honda-cb650r-2024',
  name: 'CB650R',
  brandId: honda.id,
  powerHp: 94,
});
const noPrice = motorcycleFixture({ id: 3, slug: 'yamaha-xsr-2024', name: 'XSR', priceUsd: null });

function appWith(overrides: Partial<AppDependencies> = {}, motorcycles = [mt07, cb650r, noPrice]) {
  const catalogRepository: FakeCatalogRepository = createFakeCatalogRepository();
  const app = createApp({
    motorcycleRepository: createFakeMotorcycleRepository(motorcycles),
    catalogRepository,
    exchangeRateProvider: fakeExchangeRateProvider(),
    ...overrides,
  });

  async function query<TData>(source: string, variables?: Record<string, unknown>) {
    const response = await app.fetch('http://test/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: source, variables }),
    });
    // The response shape is the GraphQL spec's; the schema guarantees the fields asked for
    return (await response.json()) as GraphQLResponse<TData>;
  }

  return { query, catalogRepository };
}

describe('GraphQL API', () => {
  it('lists a page of motorcycles with the total count', async () => {
    const { query } = appWith();

    const { data } = await query<{
      motorcycles: { totalCount: number; page: number; items: { slug: string }[] };
    }>('{ motorcycles(page: 2, pageSize: 2) { totalCount page items { slug } } }');

    expect(data?.motorcycles).toEqual({
      totalCount: 3,
      page: 2,
      items: [{ slug: 'yamaha-xsr-2024' }],
    });
  });

  it('loads the brands of a whole page in a single batch (no N+1)', async () => {
    const { query, catalogRepository } = appWith();

    const { data } = await query<{ motorcycles: { items: { brand: { name: string } }[] } }>(
      '{ motorcycles { items { brand { name } } } }',
    );

    expect(data?.motorcycles.items.map((item) => item.brand.name)).toEqual([
      'Yamaha',
      'Honda',
      'Yamaha',
    ]);
    expect(catalogRepository.brandLookups).toEqual([[1, 2]]);
  });

  it('returns null for an unknown slug', async () => {
    const { query } = appWith();

    const { data, errors } = await query<{ motorcycle: null }>(
      '{ motorcycle(slug: "nope") { name } }',
    );

    expect(errors).toBeUndefined();
    expect(data?.motorcycle).toBeNull();
  });

  it('shows input errors to the client as BAD_USER_INPUT', async () => {
    const { query } = appWith();

    const { data, errors } = await query(
      '{ compare(slugs: ["yamaha-mt-07-2024", "nope"]) { name } }',
    );

    expect(data).toBeNull();
    expect(errors).toEqual([
      expect.objectContaining({
        message: 'Unknown motorcycles: nope',
        extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }) as unknown,
      }),
    ]);
  });

  it('hides the details of unexpected errors', async () => {
    const failing = createFakeMotorcycleRepository([]);
    failing.findBySlug = () => Promise.reject(new Error('connection to db:5432 refused'));
    const { query } = appWith({ motorcycleRepository: failing });

    const { errors } = await query('{ motorcycle(slug: "yamaha-mt-07-2024") { name } }');

    expect(errors?.[0]?.message).toBe('Unexpected error.');
    expect(JSON.stringify(errors)).not.toContain('5432');
  });

  it('converts prices to pesos, and leaves them null without a price or a rate', async () => {
    const source = '{ compare(slugs: ["yamaha-mt-07-2024", "yamaha-xsr-2024"]) { priceCop } }';

    const withRate = await appWith().query<{ compare: { priceCop: number | null }[] }>(source);
    const withoutRate = await appWith({
      exchangeRateProvider: fakeExchangeRateProvider(new Error('TRM down')),
    }).query<{ compare: { priceCop: number | null }[] }>(source);

    // 8199 USD × 4000 COP/USD (fake rate)
    expect(withRate.data?.compare).toEqual([{ priceCop: 32_796_000 }, { priceCop: null }]);
    expect(withoutRate.data?.compare).toEqual([{ priceCop: null }, { priceCop: null }]);
  });

  it('exposes the photo credit only when it is complete', async () => {
    const incomplete: Motorcycle = { ...cb650r, imageAuthor: null };
    const { query } = appWith({}, [mt07, incomplete]);

    const { data } = await query<{ compare: { image: { url: string; license: string } | null }[] }>(
      '{ compare(slugs: ["yamaha-mt-07-2024", "honda-cb650r-2024"]) { image { url license } } }',
    );

    expect(data?.compare).toEqual([
      { image: { url: '/motos/yamaha-mt-07-2024.webp', license: 'CC BY-SA 4.0' } },
      { image: null },
    ]);
  });

  it('ranks the power of each motorcycle against the catalog', async () => {
    const { query } = appWith();

    const { data } = await query<{ motorcycle: { powerPercentile: number } }>(
      '{ motorcycle(slug: "honda-cb650r-2024") { powerPercentile } }',
    );

    // 94 hp beats both 72.4 hp motorcycles
    expect(data?.motorcycle.powerPercentile).toBe(100);
  });
});
