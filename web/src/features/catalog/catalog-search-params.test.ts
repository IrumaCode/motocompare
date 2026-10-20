import { describe, expect, it } from 'vitest';
import {
  parseCatalogParams,
  toMotorcyclesVariables,
  toSearchParams,
  toggleValue,
  withFilters,
  type CatalogParams,
} from './catalog-search-params';

const parse = (query: string) => parseCatalogParams(new URLSearchParams(query));

const DEFAULTS: CatalogParams = {
  brands: [],
  categories: [],
  displacement: null,
  price: null,
  sort: 'nombre',
  page: 1,
};

describe('catalog URL params', () => {
  it('reads every filter from the URL', () => {
    expect(
      parse(
        'marca=yamaha&marca=ktm&categoria=naked&cilindrada=300-650&precio=hasta-6000&orden=precio-asc&pagina=3',
      ),
    ).toEqual({
      brands: ['yamaha', 'ktm'],
      categories: ['naked'],
      displacement: '300-650',
      price: 'hasta-6000',
      sort: 'precio-asc',
      page: 3,
    });
  });

  it('falls back to defaults for unknown or broken values, so an old link still works', () => {
    expect(parse('cilindrada=9999&precio=gratis&orden=al-azar&pagina=-2')).toEqual(DEFAULTS);
    expect(parse('pagina=1.5')).toEqual(DEFAULTS);
    expect(parse('pagina=99999999')).toEqual(DEFAULTS);
  });

  it('writes a short URL that reads back to the same params', () => {
    const params: CatalogParams = { ...DEFAULTS, brands: ['honda'], price: 'mas-15000', page: 2 };

    const query = toSearchParams(params).toString();

    expect(query).toBe('marca=honda&precio=mas-15000&pagina=2');
    expect(parse(query)).toEqual(params);
  });

  it('leaves the defaults out of the URL', () => {
    expect(toSearchParams(DEFAULTS).toString()).toBe('');
  });
});

describe('toMotorcyclesVariables', () => {
  it('turns preset ids into the ranges and sort the API expects', () => {
    const variables = toMotorcyclesVariables(
      { ...DEFAULTS, displacement: 'mas-1000', sort: 'potencia-desc', page: 2 },
      12,
    );

    expect(variables).toEqual({
      filter: { brandSlugs: [], categorySlugs: [], displacementCc: { min: 1001 }, priceUsd: null },
      sort: { field: 'POWER_HP', direction: 'DESC' },
      page: 2,
      pageSize: 12,
    });
  });
});

describe('filter helpers', () => {
  it('goes back to page 1 when a filter changes', () => {
    expect(withFilters({ ...DEFAULTS, page: 4 }, { brands: ['bmw'] })).toEqual({
      ...DEFAULTS,
      brands: ['bmw'],
      page: 1,
    });
  });

  it('toggles a value of a multi-select', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});
