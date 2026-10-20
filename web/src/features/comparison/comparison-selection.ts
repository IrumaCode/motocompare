// Pure rules of the comparison tray (no React), so they are easy to reason about and test.

// Same limits as the API `compare` query (api/src/services/motorcycle-service.ts).
// Duplicated on purpose: a shared package for two numbers would be overkill.
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

export const COMPARE_PATH = '/comparar';
/** Repeated key (?moto=a&moto=b), like the catalog filters: getAll() keeps the order. */
export const COMPARE_PARAM = 'moto';

/** Enough to show the motorcycle in the tray without another query. */
export interface ComparisonItem {
  slug: string;
  name: string;
  brandName: string;
}

export type AddResult = 'added' | 'duplicate' | 'full';

export function addItem(
  items: readonly ComparisonItem[],
  item: ComparisonItem,
): { items: readonly ComparisonItem[]; result: AddResult } {
  if (items.some(({ slug }) => slug === item.slug)) {
    return { items, result: 'duplicate' };
  }
  if (items.length >= COMPARE_MAX) {
    return { items, result: 'full' };
  }
  return { items: [...items, item], result: 'added' };
}

export function removeItem(
  items: readonly ComparisonItem[],
  slug: string,
): readonly ComparisonItem[] {
  return items.filter((item) => item.slug !== slug);
}

export function isComparisonItem(value: unknown): value is ComparisonItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof value.slug === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'brandName' in value &&
    typeof value.brandName === 'string'
  );
}

/** Stored data can be anything (old versions, manual edits): keep only valid, distinct items. */
export function parseStoredItems(value: unknown): readonly ComparisonItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(isComparisonItem)
    .reduce<readonly ComparisonItem[]>((items, item) => addItem(items, item).items, []);
}

export function toCompareHref(slugs: readonly string[]): string {
  const params = new URLSearchParams(slugs.map((slug) => [COMPARE_PARAM, slug]));
  return `${COMPARE_PATH}?${params.toString()}`;
}

/** Slugs from the compare page URL: distinct and capped, so the API never rejects the count. */
export function slugsFromSearchParams(params: URLSearchParams): string[] {
  return [...new Set(params.getAll(COMPARE_PARAM).filter(Boolean))].slice(0, COMPARE_MAX);
}
