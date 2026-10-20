// Formatters are created once: building an Intl.NumberFormat is relatively expensive.
// Both currencies use Colombian conventions, so USD reads "US$ 8.999" next to "$ 33.000.000".

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

// Small ratios (hp/kg ≈ 0,1-1,2) need two decimals to tell motorcycles apart
const ratioFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCop = (value: number): string => copFormatter.format(value);
export const formatUsd = (value: number): string => usdFormatter.format(value);
export const formatNumber = (value: number): string => numberFormatter.format(value);
export const formatRatio = (value: number): string => ratioFormatter.format(value);

/** "1 moto", "12 motos" (Spanish uses the singular only for exactly one). */
export const pluralize = (count: number, singular: string, plural: string): string =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;
