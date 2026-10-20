import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { MotorcycleFilter, MotorcycleSort } from '../domain/motorcycle-search.js';
import { createPrismaClient } from '../db/prisma-client.js';
import { honda, motorcycleFixture, naked, yamaha } from '../test/fakes.js';
import { testDatabaseUrl } from '../test/test-database.js';
import { createMotorcycleRepository } from './motorcycle-repository.js';

// Integration tests: the real Prisma queries against PostgreSQL (database wiped and migrated by
// integration-setup.ts). They cover what the in-memory fakes cannot: SQL filters, null
// ordering and the id tie-break that keeps pages stable.

const prisma = createPrismaClient(testDatabaseUrl());
const repository = createMotorcycleRepository(prisma);

const sport = { id: 2, name: 'Deportiva', slug: 'deportiva' };

// Chosen to make the edge cases visible: two prices missing, a price tie, a shared year
const MOTORCYCLES = [
  motorcycleFixture({
    id: 1,
    slug: 'yamaha-mt-07',
    name: 'MT-07',
    priceUsd: 8199,
    displacementCc: 689,
    powerHp: 72.4,
  }),
  motorcycleFixture({
    id: 2,
    slug: 'yamaha-r3',
    name: 'YZF-R3',
    categoryId: sport.id,
    priceUsd: 5799,
    displacementCc: 321,
    powerHp: 41,
  }),
  motorcycleFixture({
    id: 3,
    slug: 'yamaha-xsr',
    name: 'XSR900',
    priceUsd: null,
    displacementCc: 890,
    powerHp: 117,
  }),
  motorcycleFixture({
    id: 4,
    slug: 'honda-cb650r',
    name: 'CB650R',
    brandId: honda.id,
    priceUsd: 8199,
    displacementCc: 649,
    powerHp: 94,
  }),
  motorcycleFixture({
    id: 5,
    slug: 'honda-rebel',
    name: 'Rebel 1100',
    brandId: honda.id,
    priceUsd: null,
    displacementCc: 1084,
    powerHp: 86,
  }),
];

const NAME_ASC: MotorcycleSort = { field: 'NAME', direction: 'ASC' };

async function slugs(filter: MotorcycleFilter, sort = NAME_ASC, skip = 0, take = 50) {
  const { items } = await repository.findMany({ filter, sort, skip, take });
  return items.map((motorcycle) => motorcycle.slug);
}

beforeAll(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE motorcycles, brands, categories RESTART IDENTITY CASCADE',
  );
  await prisma.brand.createMany({ data: [yamaha, honda] });
  await prisma.category.createMany({ data: [naked, sport] });
  await prisma.motorcycle.createMany({ data: MOTORCYCLES });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('MotorcycleRepository.findMany (PostgreSQL)', () => {
  it('sorts by brand and then model name', async () => {
    expect(await slugs({})).toEqual([
      'honda-cb650r',
      'honda-rebel',
      'yamaha-mt-07',
      'yamaha-xsr',
      'yamaha-r3',
    ]);
  });

  it('filters by any of the given brands and categories; an empty list does not filter', async () => {
    expect(await slugs({ brandSlugs: ['honda'] })).toEqual(['honda-cb650r', 'honda-rebel']);
    expect(await slugs({ brandSlugs: ['yamaha'], categorySlugs: ['deportiva'] })).toEqual([
      'yamaha-r3',
    ]);
    expect(await slugs({ brandSlugs: [], categorySlugs: [] })).toHaveLength(5);
  });

  it('applies inclusive ranges', async () => {
    expect(await slugs({ displacementCc: { min: 649, max: 890 } })).toEqual([
      'honda-cb650r',
      'yamaha-mt-07',
      'yamaha-xsr',
    ]);
  });

  it('leaves motorcycles without price out of a price range, but not out of an open one', async () => {
    expect(await slugs({ priceUsd: { min: 0 } })).not.toContain('yamaha-xsr');
    expect(await slugs({ priceUsd: { min: null, max: null } })).toContain('yamaha-xsr');
  });

  it('puts motorcycles without price last in both directions, breaking ties by id', async () => {
    const byPrice = (direction: 'ASC' | 'DESC') => slugs({}, { field: 'PRICE_USD', direction });

    // MT-07 (id 1) and CB650R (id 4) cost the same: the lower id goes first
    expect(await byPrice('ASC')).toEqual([
      'yamaha-r3',
      'yamaha-mt-07',
      'honda-cb650r',
      'yamaha-xsr',
      'honda-rebel',
    ]);
    expect(await byPrice('DESC')).toEqual([
      'yamaha-mt-07',
      'honda-cb650r',
      'yamaha-r3',
      'yamaha-xsr',
      'honda-rebel',
    ]);
  });

  it('pages without overlapping or skipping rows when every value ties', async () => {
    const sameYear: MotorcycleSort = { field: 'YEAR', direction: 'DESC' };

    const pages = [
      await slugs({}, sameYear, 0, 2),
      await slugs({}, sameYear, 2, 2),
      await slugs({}, sameYear, 4, 2),
    ];

    expect(pages.flat()).toEqual(MOTORCYCLES.map((motorcycle) => motorcycle.slug));
  });

  it('counts every match, not only the current page', async () => {
    const { items, totalCount } = await repository.findMany({
      filter: { brandSlugs: ['yamaha'] },
      sort: NAME_ASC,
      skip: 0,
      take: 1,
    });

    expect(items).toHaveLength(1);
    expect(totalCount).toBe(3);
  });
});

describe('MotorcycleRepository lookups (PostgreSQL)', () => {
  it('finds several motorcycles by slug and ignores unknown ones', async () => {
    const found = await repository.findBySlugs(['honda-rebel', 'yamaha-r3', 'nope']);

    expect(found.map((motorcycle) => motorcycle.slug).sort()).toEqual(['honda-rebel', 'yamaha-r3']);
  });

  it('lists the power of every motorcycle', async () => {
    expect((await repository.listPowerHp()).sort((a, b) => a - b)).toEqual([41, 72.4, 86, 94, 117]);
  });
});
