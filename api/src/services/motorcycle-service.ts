import { InputError } from '../errors.js';
import type { Motorcycle } from '../generated/prisma/client.js';
import type { IntRange, MotorcycleFilter, MotorcycleSort } from '../domain/motorcycle-search.js';
import type { MotorcycleRepository } from '../repositories/motorcycle-repository.js';

const MAX_PAGE_SIZE = 50;
const COMPARE_MIN = 2;
const COMPARE_MAX = 4;

export interface MotorcycleSearch {
  readonly filter?: MotorcycleFilter | null;
  readonly sort: MotorcycleSort;
  /** 1-based */
  readonly page: number;
  readonly pageSize: number;
}

export interface MotorcyclePage {
  items: Motorcycle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MotorcycleService {
  search(search: MotorcycleSearch): Promise<MotorcyclePage>;
  findBySlug(slug: string): Promise<Motorcycle | null>;
  compare(slugs: readonly string[]): Promise<Motorcycle[]>;
  /** For each power value, the percentile it reaches in the catalog (see percentileBelow). */
  powerPercentiles(powersHp: readonly number[]): Promise<number[]>;
}

/**
 * Share (0-100) of the *other* catalog values that are strictly lower than `value`.
 * `values` includes the motorcycle itself, so the most powerful one gets 100 (unless it shares
 * that power with another motorcycle: a tie is not "strictly lower").
 */
export function percentileBelow(values: readonly number[], value: number): number {
  const others = values.length - 1;
  if (others <= 0) {
    return 100;
  }
  const below = values.filter((other) => other < value).length;
  return (below / others) * 100;
}

function assertValidRange(name: string, range: IntRange | null | undefined): void {
  const min = range?.min;
  const max = range?.max;
  if (min != null && max != null && min > max) {
    throw new InputError(
      `${name}: min (${String(min)}) cannot be greater than max (${String(max)})`,
    );
  }
}

function assertValidPaging(page: number, pageSize: number): void {
  if (page < 1) {
    throw new InputError('page must be 1 or greater');
  }
  if (pageSize < 1) {
    throw new InputError('pageSize must be 1 or greater');
  }
}

function assertComparable(slugs: readonly string[]): void {
  if (slugs.length < COMPARE_MIN || slugs.length > COMPARE_MAX) {
    throw new InputError(
      `compare needs between ${String(COMPARE_MIN)} and ${String(COMPARE_MAX)} motorcycles`,
    );
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new InputError('compare slugs must be distinct');
  }
}

export function createMotorcycleService(repository: MotorcycleRepository): MotorcycleService {
  return {
    async search({ filter, sort, page, pageSize }) {
      assertValidPaging(page, pageSize);
      assertValidRange('displacementCc', filter?.displacementCc);
      assertValidRange('priceUsd', filter?.priceUsd);

      const take = Math.min(pageSize, MAX_PAGE_SIZE);
      const { items, totalCount } = await repository.findMany({
        filter: filter ?? {},
        sort,
        skip: (page - 1) * take,
        take,
      });
      return { items, totalCount, page, pageSize: take };
    },

    findBySlug(slug) {
      return repository.findBySlug(slug);
    },

    async compare(slugs) {
      assertComparable(slugs);

      const found = new Map(
        (await repository.findBySlugs(slugs)).map((motorcycle) => [motorcycle.slug, motorcycle]),
      );
      const missing = slugs.filter((slug) => !found.has(slug));
      if (missing.length > 0) {
        throw new InputError(`Unknown motorcycles: ${missing.join(', ')}`);
      }
      // Keep the order the client asked for (columns of the comparison table)
      return slugs.map((slug) => found.get(slug)).filter((motorcycle) => motorcycle !== undefined);
    },

    async powerPercentiles(powersHp) {
      const catalogPowers = await repository.listPowerHp();
      return powersHp.map((powerHp) => percentileBelow(catalogPowers, powerHp));
    },
  };
}
