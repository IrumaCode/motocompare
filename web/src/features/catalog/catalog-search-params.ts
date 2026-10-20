import type { CatalogMotorcyclesQueryVariables } from '../../generated/graphql/graphql';
import {
  DEFAULT_SORT,
  DISPLACEMENT_PRESETS,
  PRICE_PRESETS,
  SORT_OPTIONS,
  type DisplacementPresetId,
  type PricePresetId,
  type RangePreset,
  type SortOptionId,
} from './catalog-presets';

// The URL is the single source of truth for the catalog state: shareable links, reload-safe,
// and the back button undoes a filter. These pure functions translate between both worlds.

export interface CatalogParams {
  brands: string[];
  categories: string[];
  displacement: DisplacementPresetId | null;
  price: PricePresetId | null;
  sort: SortOptionId;
  /** 1-based */
  page: number;
}

/** URL keys, in Spanish because users see them: /motos?marca=yamaha&orden=precio-asc */
const KEYS = {
  brands: 'marca',
  categories: 'categoria',
  displacement: 'cilindrada',
  price: 'precio',
  sort: 'orden',
  page: 'pagina',
} as const;

function findId<T extends { id: string }>(
  options: readonly T[],
  value: string | null,
): T['id'] | null {
  return options.find((option) => option.id === value)?.id ?? null;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

/** Unknown preset ids fall back to "no filter", so a broken link still shows the catalog. */
export function parseCatalogParams(searchParams: URLSearchParams): CatalogParams {
  return {
    brands: searchParams.getAll(KEYS.brands),
    categories: searchParams.getAll(KEYS.categories),
    displacement: findId(DISPLACEMENT_PRESETS, searchParams.get(KEYS.displacement)),
    price: findId(PRICE_PRESETS, searchParams.get(KEYS.price)),
    sort: findId(SORT_OPTIONS, searchParams.get(KEYS.sort)) ?? DEFAULT_SORT,
    page: parsePage(searchParams.get(KEYS.page)),
  };
}

/** Default values are left out so URLs stay short. */
export function toSearchParams(params: CatalogParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const brand of params.brands) searchParams.append(KEYS.brands, brand);
  for (const category of params.categories) searchParams.append(KEYS.categories, category);
  if (params.displacement) searchParams.set(KEYS.displacement, params.displacement);
  if (params.price) searchParams.set(KEYS.price, params.price);
  if (params.sort !== DEFAULT_SORT) searchParams.set(KEYS.sort, params.sort);
  if (params.page > 1) searchParams.set(KEYS.page, String(params.page));
  return searchParams;
}

function rangeOf(options: readonly RangePreset[], id: string | null) {
  return options.find((option) => option.id === id)?.range ?? null;
}

function sortOf(id: SortOptionId) {
  return (SORT_OPTIONS.find((option) => option.id === id) ?? SORT_OPTIONS[0]).sort;
}

export function toMotorcyclesVariables(
  params: CatalogParams,
  pageSize: number,
): CatalogMotorcyclesQueryVariables {
  return {
    filter: {
      brandSlugs: params.brands,
      categorySlugs: params.categories,
      displacementCc: rangeOf(DISPLACEMENT_PRESETS, params.displacement),
      priceUsd: rangeOf(PRICE_PRESETS, params.price),
    },
    sort: sortOf(params.sort),
    page: params.page,
    pageSize,
  };
}

export function countActiveFilters(params: CatalogParams): number {
  return (
    params.brands.length +
    params.categories.length +
    (params.displacement ? 1 : 0) +
    (params.price ? 1 : 0)
  );
}

export type FiltersPatch = Partial<Omit<CatalogParams, 'page'>>;

/** Any filter change goes back to page 1: the old page may no longer exist. */
export function withFilters(params: CatalogParams, patch: FiltersPatch): CatalogParams {
  return { ...params, ...patch, page: 1 };
}

export const NO_FILTERS = {
  brands: [],
  categories: [],
  displacement: null,
  price: null,
} as const satisfies Partial<CatalogParams>;

/** Adds the value when absent, removes it when present (multi-select chips). */
export function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
