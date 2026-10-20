// Pure rules of the comparison tray (no React), so they are easy to reason about and test.

// Same limits as the API `compare` query (api/src/services/motorcycle-service.ts).
// Duplicated on purpose: a shared package for two numbers would be overkill.
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

/** Enough to show the motorcycle in the tray without another query. */
export interface ComparisonItem {
  slug: string;
  name: string;
  brandName: string;
}

/** Any motorcycle from a query (card, detail) as a tray item. */
export function toComparisonItem(motorcycle: {
  slug: string;
  name: string;
  brand: { name: string };
}): ComparisonItem {
  return { slug: motorcycle.slug, name: motorcycle.name, brandName: motorcycle.brand.name };
}

/** "Yamaha MT-07": how the UI names a motorcycle outside its own card. */
export const itemName = (item: ComparisonItem): string => `${item.brandName} ${item.name}`;

/** Adds at the end, unless it is already there or the tray is full (then nothing changes). */
export function addItem(
  items: readonly ComparisonItem[],
  item: ComparisonItem,
): readonly ComparisonItem[] {
  const isDuplicate = items.some(({ slug }) => slug === item.slug);
  return isDuplicate || items.length >= COMPARE_MAX ? items : [...items, item];
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
  return value.filter(isComparisonItem).reduce<readonly ComparisonItem[]>(addItem, []);
}
