import { SERIES } from '../comparison-series';

/** Colors of the current theme, read from the CSS variables in index.css. */
export interface ChartColors {
  ink: string;
  inkMuted: string;
  line: string;
  surface: string;
  series: string[];
  /** Chart.js does not follow prefers-reduced-motion by itself */
  reduceMotion: boolean;
}

/**
 * Canvas can't use CSS classes, so the theme colors are read at runtime. Must run after the
 * theme is applied to <html> (inside an effect, never during render).
 */
export function readChartColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement);
  const cssVar = (name: string) => styles.getPropertyValue(name).trim();
  return {
    ink: cssVar('--ink'),
    inkMuted: cssVar('--ink-muted'),
    line: cssVar('--line'),
    surface: cssVar('--surface'),
    series: SERIES.map(({ cssVar: name }) => cssVar(name)),
    reduceMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

/** "#rrggbb" plus an alpha channel (the series colors are defined as 6-digit hex). */
export function withAlpha(hexColor: string, alpha: number): string {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${channel}`;
}
