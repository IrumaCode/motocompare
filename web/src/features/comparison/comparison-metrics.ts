import { formatNumber, formatRatio, formatUsd } from '../../lib/format';
import type { ComparedMotorcycle } from './compare-query';

// Single definition of every number the comparison shows. The table, the hp/kg race and the
// charts all read it, so a metric's label, unit and "which value wins" live in one place.

/** Which value wins; null when neither is better (e.g. a taller seat is not "better"). */
export type Direction = 'higher' | 'lower';

export type MetricId =
  | 'powerHp'
  | 'torqueNm'
  | 'powerToWeight'
  | 'displacementCc'
  | 'weightKg'
  | 'seatHeightMm'
  | 'fuelCapacityL'
  | 'priceUsd';

export interface ComparisonMetric {
  id: MetricId;
  label: string;
  /** Axis name when the value becomes a score, if it differs (lower weight reads "Ligereza"). */
  scoreLabel?: string;
  direction: Direction | null;
  /** null when the value is unknown (some motorcycles have no confirmed price). */
  value: (motorcycle: ComparedMotorcycle) => number | null;
  format: (value: number) => string;
}

const withUnit = (unit: string) => (value: number) => `${formatNumber(value)} ${unit}`;

export const METRICS: Record<MetricId, ComparisonMetric> = {
  powerHp: {
    id: 'powerHp',
    label: 'Potencia',
    direction: 'higher',
    value: (m) => m.powerHp,
    format: withUnit('hp'),
  },
  torqueNm: {
    id: 'torqueNm',
    label: 'Torque',
    direction: 'higher',
    value: (m) => m.torqueNm,
    format: withUnit('Nm'),
  },
  powerToWeight: {
    id: 'powerToWeight',
    label: 'Potencia por kilo',
    direction: 'higher',
    // Power-to-weight ratio: the number that best predicts acceleration
    value: (m) => m.powerHp / m.weightKg,
    format: (value) => `${formatRatio(value)} hp/kg`,
  },
  displacementCc: {
    id: 'displacementCc',
    label: 'Cilindrada',
    direction: null,
    value: (m) => m.displacementCc,
    format: withUnit('cc'),
  },
  weightKg: {
    id: 'weightKg',
    label: 'Peso en orden de marcha',
    scoreLabel: 'Ligereza',
    direction: 'lower',
    value: (m) => m.weightKg,
    format: withUnit('kg'),
  },
  seatHeightMm: {
    id: 'seatHeightMm',
    label: 'Altura del asiento',
    direction: null,
    value: (m) => m.seatHeightMm,
    format: withUnit('mm'),
  },
  fuelCapacityL: {
    id: 'fuelCapacityL',
    label: 'Depósito',
    direction: 'higher',
    value: (m) => m.fuelCapacityL,
    format: withUnit('L'),
  },
  priceUsd: {
    id: 'priceUsd',
    label: 'Precio base (EE. UU.)',
    scoreLabel: 'Precio accesible',
    direction: 'lower',
    value: (m) => m.priceUsd,
    format: formatUsd,
  },
};

const knownValues = (values: readonly (number | null)[]): number[] =>
  values.filter((value) => value !== null);

/**
 * Which motorcycles hold the best value (all of them on a tie for first). Nobody wins when the
 * metric has no direction, fewer than two values are known, or every known value is equal.
 */
export function bestFlags(
  metric: ComparisonMetric,
  motorcycles: readonly ComparedMotorcycle[],
): boolean[] {
  const values = motorcycles.map(metric.value);
  const known = knownValues(values);
  const noWinner = motorcycles.map(() => false);
  if (metric.direction === null || known.length < 2) return noWinner;

  const best = metric.direction === 'higher' ? Math.max(...known) : Math.min(...known);
  if (known.every((value) => value === best)) return noWinner;
  return values.map((value) => value === best);
}

/**
 * Score in (0, 1] relative to the best motorcycle of this comparison (the best gets 1).
 * Ratios instead of min-max scaling: min-max would put the worst at 0 and exaggerate small gaps.
 * null for unknown values or metrics without a direction.
 */
export function scores(
  metric: ComparisonMetric,
  motorcycles: readonly ComparedMotorcycle[],
): (number | null)[] {
  const values = motorcycles.map(metric.value);
  const known = knownValues(values).filter((value) => value > 0);
  if (metric.direction === null || known.length === 0) return values.map(() => null);

  const max = Math.max(...known);
  const min = Math.min(...known);
  return values.map((value) => {
    if (value === null || value <= 0) return null;
    return metric.direction === 'higher' ? value / max : min / value;
  });
}
