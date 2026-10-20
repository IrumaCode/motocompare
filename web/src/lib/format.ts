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

export const formatCop = (value: number): string => copFormatter.format(value);
export const formatUsd = (value: number): string => usdFormatter.format(value);
export const formatNumber = (value: number): string => numberFormatter.format(value);

/** "1 moto", "12 motos" (Spanish uses the singular only for exactly one). */
export const pluralize = (count: number, singular: string, plural: string): string =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;
