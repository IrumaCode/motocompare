import type { Motorcycle, Prisma, PrismaClient } from '../generated/prisma/client.js';
import type {
  IntRange,
  MotorcycleFilter,
  MotorcycleSort,
  MotorcycleSortField,
} from '../domain/motorcycle-search.js';

export interface MotorcycleQuery {
  readonly filter: MotorcycleFilter;
  readonly sort: MotorcycleSort;
  readonly skip: number;
  readonly take: number;
}

export interface MotorcycleRepository {
  findMany(query: MotorcycleQuery): Promise<{ items: Motorcycle[]; totalCount: number }>;
  findBySlug(slug: string): Promise<Motorcycle | null>;
  findBySlugs(slugs: readonly string[]): Promise<Motorcycle[]>;
}

type OrderBy = Prisma.MotorcycleOrderByWithRelationInput;

const ORDER_BY: Record<MotorcycleSortField, (direction: Prisma.SortOrder) => OrderBy[]> = {
  // Full display name: "Honda CB500F" sorts by brand first, then model
  NAME: (direction) => [{ brand: { name: direction } }, { name: direction }],
  YEAR: (direction) => [{ year: direction }],
  // priceUsd is nullable: motorcycles without a price go last in both directions
  PRICE_USD: (direction) => [{ priceUsd: { sort: direction, nulls: 'last' } }],
  DISPLACEMENT_CC: (direction) => [{ displacementCc: direction }],
  POWER_HP: (direction) => [{ powerHp: direction }],
  WEIGHT_KG: (direction) => [{ weightKg: direction }],
};

function toOrderBy({ field, direction }: MotorcycleSort): OrderBy[] {
  const primary = ORDER_BY[field](direction === 'ASC' ? 'asc' : 'desc');
  // Tie-break by id so pages never overlap or skip rows
  return [...primary, { id: 'asc' }];
}

/** An empty or missing list means "do not filter". */
function toSlugFilter(slugs: readonly string[] | null | undefined) {
  return slugs?.length ? { slug: { in: [...slugs] } } : undefined;
}

/** A range without bounds means "do not filter" (so it does not exclude null prices either). */
function toIntFilter(range: IntRange | null | undefined) {
  const gte = range?.min ?? undefined;
  const lte = range?.max ?? undefined;
  return gte === undefined && lte === undefined ? undefined : { gte, lte };
}

function toWhere(filter: MotorcycleFilter): Prisma.MotorcycleWhereInput {
  return {
    brand: toSlugFilter(filter.brandSlugs),
    category: toSlugFilter(filter.categorySlugs),
    displacementCc: toIntFilter(filter.displacementCc),
    priceUsd: toIntFilter(filter.priceUsd),
  };
}

export function createMotorcycleRepository(prisma: PrismaClient): MotorcycleRepository {
  return {
    async findMany({ filter, sort, skip, take }) {
      const where = toWhere(filter);
      const [items, totalCount] = await Promise.all([
        prisma.motorcycle.findMany({ where, orderBy: toOrderBy(sort), skip, take }),
        prisma.motorcycle.count({ where }),
      ]);
      return { items, totalCount };
    },

    findBySlug(slug) {
      return prisma.motorcycle.findUnique({ where: { slug } });
    },

    findBySlugs(slugs) {
      return prisma.motorcycle.findMany({ where: { slug: { in: [...slugs] } } });
    },
  };
}
