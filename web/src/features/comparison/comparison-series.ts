// Visual identity of each compared motorcycle, by column position. Color plus shape, so the
// series stay distinguishable for color-blind users and in grayscale.

export type SeriesShape = 'circle' | 'triangle' | 'square' | 'diamond';

export interface Series {
  /** CSS variable defined per theme in index.css (charts read it at runtime). */
  cssVar: `--series-${1 | 2 | 3 | 4}`;
  /** Full class names, so Tailwind finds them when scanning the code. */
  fillClass: string;
  bgClass: string;
  shape: SeriesShape;
  /** Line pattern in the radar chart (canvas setLineDash); a third cue besides color and shape. */
  lineDash: number[];
}

export const SERIES: readonly [Series, Series, Series, Series] = [
  {
    cssVar: '--series-1',
    fillClass: 'fill-series-1',
    bgClass: 'bg-series-1',
    shape: 'circle',
    lineDash: [],
  },
  {
    cssVar: '--series-2',
    fillClass: 'fill-series-2',
    bgClass: 'bg-series-2',
    shape: 'triangle',
    lineDash: [8, 4],
  },
  {
    cssVar: '--series-3',
    fillClass: 'fill-series-3',
    bgClass: 'bg-series-3',
    shape: 'square',
    lineDash: [2, 3],
  },
  {
    cssVar: '--series-4',
    fillClass: 'fill-series-4',
    bgClass: 'bg-series-4',
    shape: 'diamond',
    lineDash: [10, 3, 2, 3],
  },
];

/** The comparison has at most 4 motorcycles (COMPARE_MAX), one series each. */
export function seriesAt(index: number): Series {
  return SERIES[index % SERIES.length] ?? SERIES[0];
}
