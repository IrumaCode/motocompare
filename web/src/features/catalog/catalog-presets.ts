import type { IntRange, MotorcycleSort } from '../../generated/graphql/graphql';

// Filter and sort choices as data: the UI renders them and the URL stores their ids.
// Ranges are inclusive and must not overlap.

export interface RangePreset {
  readonly id: string;
  readonly label: string;
  readonly range: IntRange;
}

export const DISPLACEMENT_PRESETS = [
  { id: 'hasta-300', label: 'Hasta 300 cc', range: { max: 300 } },
  { id: '300-650', label: '301 a 650 cc', range: { min: 301, max: 650 } },
  { id: '650-1000', label: '651 a 1.000 cc', range: { min: 651, max: 1000 } },
  { id: 'mas-1000', label: 'Más de 1.000 cc', range: { min: 1001 } },
] as const satisfies readonly RangePreset[];

// In US$: the API filters by priceUsd, and peso ranges would shift every day with the TRM
export const PRICE_PRESETS = [
  { id: 'hasta-6000', label: 'Hasta US$ 6.000', range: { max: 6000 } },
  { id: '6000-10000', label: 'US$ 6.001 a 10.000', range: { min: 6001, max: 10000 } },
  { id: '10000-15000', label: 'US$ 10.001 a 15.000', range: { min: 10001, max: 15000 } },
  { id: 'mas-15000', label: 'Más de US$ 15.000', range: { min: 15001 } },
] as const satisfies readonly RangePreset[];

export const SORT_OPTIONS = [
  { id: 'nombre', label: 'Nombre (A-Z)', sort: { field: 'NAME', direction: 'ASC' } },
  {
    id: 'precio-asc',
    label: 'Precio: menor a mayor',
    sort: { field: 'PRICE_USD', direction: 'ASC' },
  },
  {
    id: 'precio-desc',
    label: 'Precio: mayor a menor',
    sort: { field: 'PRICE_USD', direction: 'DESC' },
  },
  {
    id: 'potencia-desc',
    label: 'Más potentes primero',
    sort: { field: 'POWER_HP', direction: 'DESC' },
  },
  { id: 'peso-asc', label: 'Más livianas primero', sort: { field: 'WEIGHT_KG', direction: 'ASC' } },
  {
    id: 'cilindrada-asc',
    label: 'Cilindrada: menor a mayor',
    sort: { field: 'DISPLACEMENT_CC', direction: 'ASC' },
  },
] as const satisfies readonly { id: string; label: string; sort: MotorcycleSort }[];

export type DisplacementPresetId = (typeof DISPLACEMENT_PRESETS)[number]['id'];
export type PricePresetId = (typeof PRICE_PRESETS)[number]['id'];
export type SortOptionId = (typeof SORT_OPTIONS)[number]['id'];

export const DEFAULT_SORT: SortOptionId = 'nombre';
