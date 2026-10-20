import { useQuery } from '@apollo/client/react';
import { SlidersHorizontalIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { ColdStartNotice } from '../../components/ColdStartNotice';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { graphql } from '../../generated/graphql';
import { pluralize } from '../../lib/format';
import { useSlowLoading } from '../../lib/use-slow-loading';
import { MotorcycleCard } from '../motorcycles/MotorcycleCard';
import { MotorcycleCardSkeleton } from '../motorcycles/MotorcycleCardSkeleton';
import { CatalogEmptyState } from './CatalogEmptyState';
import { CatalogFilters } from './CatalogFilters';
import { SORT_OPTIONS, type SortOptionId } from './catalog-presets';
import {
  countActiveFilters,
  NO_FILTERS,
  toMotorcyclesVariables,
  toSearchParams,
  withFilters,
} from './catalog-search-params';
import { FiltersDialog } from './FiltersDialog';
import { Pagination } from './Pagination';
import { useCatalogParams } from './use-catalog-params';

const PAGE_SIZE = 12;
const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

// Separate from the results query: changing a filter must not refetch the filter options
const filterOptionsQuery = graphql(`
  query CatalogFilterOptions {
    brands {
      id
      slug
      name
    }
    categories {
      id
      slug
      name
    }
  }
`);

const catalogQuery = graphql(`
  query CatalogMotorcycles(
    $filter: MotorcycleFilter
    $sort: MotorcycleSort!
    $page: Int!
    $pageSize: Int!
  ) {
    motorcycles(filter: $filter, sort: $sort, page: $page, pageSize: $pageSize) {
      totalCount
      items {
        id
        ...MotorcycleCard
      }
    }
  }
`);

function isSortOptionId(value: string): value is SortOptionId {
  return SORT_OPTIONS.some((option) => option.id === value);
}

function ResultsSkeleton({ isSlow }: { isSlow: boolean }) {
  return (
    <div role="status" className="flex flex-col gap-4">
      {isSlow ? <ColdStartNotice /> : <span className="sr-only">Cargando motos…</span>}
      <div aria-hidden="true" className={GRID_CLASSES}>
        {Array.from({ length: 6 }, (_, index) => (
          <MotorcycleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function CatalogPage() {
  const { params, setParams } = useCatalogParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterOptions = useQuery(filterOptionsQuery);
  const { data, previousData, loading, error, refetch } = useQuery(catalogQuery, {
    variables: toMotorcyclesVariables(params, PAGE_SIZE),
  });
  // While new results load, keep showing the previous ones instead of flashing a skeleton
  const results = (data ?? previousData)?.motorcycles;
  const isSlow = useSlowLoading(loading && !results);

  // After using the pagination, move focus (and the scroll) to the top of the results.
  // Only then: a filter or sort change also resets the page, but focus must stay on that control.
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusResultsOnPageChange = useRef(false);
  useEffect(() => {
    if (focusResultsOnPageChange.current) {
      focusResultsOnPageChange.current = false;
      resultsHeadingRef.current?.focus();
    }
  }, [params.page]);

  const activeFilters = countActiveFilters(params);
  const totalPages = results ? Math.ceil(results.totalCount / PAGE_SIZE) : 0;
  const clearFilters = () => {
    setParams(withFilters(params, NO_FILTERS));
  };

  const filters = (
    <CatalogFilters
      params={params}
      onChange={setParams}
      brands={filterOptions.data?.brands ?? []}
      categories={filterOptions.data?.categories ?? []}
    />
  );

  function renderResults() {
    // Checked before `results`: after a failed filter change, previousData would otherwise
    // show the old list as if the filter had applied. On retry `loading` turns true again.
    if (error && !loading) {
      return (
        <ErrorState
          message="No pudimos cargar el catálogo. Inténtalo de nuevo en unos segundos."
          onRetry={() => void refetch()}
        />
      );
    }
    if (!results) {
      return <ResultsSkeleton isSlow={isSlow} />;
    }
    if (results.totalCount === 0) {
      return (
        <CatalogEmptyState
          title="Ninguna moto coincide con tus filtros"
          message="Prueba quitando alguno de los filtros para ver más motos."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      );
    }
    if (results.items.length === 0) {
      return (
        <CatalogEmptyState
          title="Esta página no existe"
          message={`El catálogo con estos filtros tiene ${pluralize(totalPages, 'página', 'páginas')}.`}
          actionLabel="Ir a la página 1"
          onAction={() => {
            setParams({ ...params, page: 1 });
          }}
        />
      );
    }
    return (
      <div className="flex flex-col gap-8">
        <div
          aria-busy={loading}
          className={`${GRID_CLASSES} transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`}
        >
          {results.items.map((motorcycle) => (
            <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
          ))}
        </div>
        <Pagination
          page={params.page}
          totalPages={totalPages}
          hrefFor={(page) => `?${toSearchParams({ ...params, page }).toString()}`}
          onNavigate={() => {
            focusResultsOnPageChange.current = true;
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <title>Catálogo · MotoCompare</title>
      <header>
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Catálogo</h1>
        <p className="mt-2 text-ink-muted">
          Filtra por marca, categoría, cilindrada y precio, y abre cualquier moto para ver su ficha
          completa.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside aria-label="Filtros" className="hidden lg:block">
          {filters}
        </aside>

        <section aria-labelledby="results-heading" className="relative flex min-w-0 flex-col gap-4">
          <h2
            id="results-heading"
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="sr-only scroll-mt-24"
          >
            Resultados
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-ink-muted">
              {results ? pluralize(results.totalCount, 'moto', 'motos') : ''}
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="ghost"
                className="shrink-0 lg:hidden"
                onClick={() => {
                  setFiltersOpen(true);
                }}
              >
                <SlidersHorizontalIcon />
                {activeFilters > 0 ? `Filtros (${String(activeFilters)})` : 'Filtros'}
              </Button>
              <label className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:flex-none">
                {/* Hidden on phones to fit one row; the select keeps it as its accessible name */}
                <span className="sr-only text-ink-muted sm:not-sr-only">Ordenar por</span>
                <select
                  value={params.sort}
                  onChange={(event) => {
                    const sort = event.target.value;
                    if (isSortOptionId(sort)) setParams(withFilters(params, { sort }));
                  }}
                  className="min-h-11 w-full min-w-0 cursor-pointer rounded-lg border border-line bg-surface px-3 text-ink sm:w-auto"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {renderResults()}
        </section>
      </div>

      <FiltersDialog
        open={filtersOpen}
        onClose={() => {
          setFiltersOpen(false);
        }}
        resultCount={results?.totalCount ?? null}
      >
        {filters}
      </FiltersDialog>
    </div>
  );
}
