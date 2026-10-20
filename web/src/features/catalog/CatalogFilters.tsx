import type { ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { DISPLACEMENT_PRESETS, PRICE_PRESETS } from './catalog-presets';
import {
  countActiveFilters,
  NO_FILTERS,
  toggleValue,
  withFilters,
  type CatalogParams,
  type FiltersPatch,
} from './catalog-search-params';
import { FilterChip } from './FilterChip';

export interface FilterOption {
  slug: string;
  name: string;
}

interface CatalogFiltersProps {
  params: CatalogParams;
  onChange: (next: CatalogParams) => void;
  brands: readonly FilterOption[];
  categories: readonly FilterOption[];
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** Presentational: the same filters render in the desktop sidebar and in the mobile sheet. */
export function CatalogFilters({ params, onChange, brands, categories }: CatalogFiltersProps) {
  const update = (patch: FiltersPatch) => {
    onChange(withFilters(params, patch));
  };

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup legend="Marca">
        {brands.map((brand) => (
          <FilterChip
            key={brand.slug}
            label={brand.name}
            pressed={params.brands.includes(brand.slug)}
            onToggle={() => {
              update({ brands: toggleValue(params.brands, brand.slug) });
            }}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Categoría">
        {categories.map((category) => (
          <FilterChip
            key={category.slug}
            label={category.name}
            pressed={params.categories.includes(category.slug)}
            onToggle={() => {
              update({ categories: toggleValue(params.categories, category.slug) });
            }}
          />
        ))}
      </FilterGroup>

      {/* Single choice: pressing the active range clears it */}
      <FilterGroup legend="Cilindrada">
        {DISPLACEMENT_PRESETS.map((preset) => (
          <FilterChip
            key={preset.id}
            label={preset.label}
            pressed={params.displacement === preset.id}
            onToggle={() => {
              update({ displacement: params.displacement === preset.id ? null : preset.id });
            }}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Precio">
        {PRICE_PRESETS.map((preset) => (
          <FilterChip
            key={preset.id}
            label={preset.label}
            pressed={params.price === preset.id}
            onToggle={() => {
              update({ price: params.price === preset.id ? null : preset.id });
            }}
          />
        ))}
        <p className="w-full text-xs text-ink-muted">
          Las motos sin precio oficial no aparecen al filtrar por precio.
        </p>
      </FilterGroup>

      {countActiveFilters(params) > 0 && (
        <Button
          variant="ghost"
          onClick={() => {
            update(NO_FILTERS);
          }}
          className="self-start"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
