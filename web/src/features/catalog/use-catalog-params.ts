import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { parseCatalogParams, toSearchParams, type CatalogParams } from './catalog-search-params';

/** Catalog state read from and written to the URL. Each change adds a history entry. */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseCatalogParams(searchParams), [searchParams]);

  const setParams = useCallback(
    (next: CatalogParams) => {
      setSearchParams(toSearchParams(next));
    },
    [setSearchParams],
  );

  return { params, setParams };
}
