import { COMPARE_MAX } from './comparison-selection';

// The compare page URL is the source of truth for what it shows, so a comparison can be shared.

export const COMPARE_PATH = '/comparar';
/** Repeated key (?moto=a&moto=b), like the catalog filters: getAll() keeps the order. */
const COMPARE_PARAM = 'moto';

export function toCompareHref(slugs: readonly string[]): string {
  const params = new URLSearchParams(slugs.map((slug) => [COMPARE_PARAM, slug]));
  return `${COMPARE_PATH}?${params.toString()}`;
}

/** Slugs from the compare page URL: distinct and capped, so the API never rejects the count. */
export function slugsFromSearchParams(params: URLSearchParams): string[] {
  return [...new Set(params.getAll(COMPARE_PARAM).filter(Boolean))].slice(0, COMPARE_MAX);
}
