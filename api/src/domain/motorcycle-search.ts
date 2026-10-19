// Search criteria shared by the service and the repository.
// Optional values may be null because GraphQL inputs use null for "not provided".

export interface IntRange {
  readonly min?: number | null;
  readonly max?: number | null;
}

export interface MotorcycleFilter {
  readonly brandSlugs?: readonly string[] | null;
  readonly categorySlugs?: readonly string[] | null;
  readonly displacementCc?: IntRange | null;
  readonly priceUsd?: IntRange | null;
}

export type MotorcycleSortField =
  'NAME' | 'YEAR' | 'PRICE_USD' | 'DISPLACEMENT_CC' | 'POWER_HP' | 'WEIGHT_KG';

export type SortDirection = 'ASC' | 'DESC';

export interface MotorcycleSort {
  readonly field: MotorcycleSortField;
  readonly direction: SortDirection;
}
