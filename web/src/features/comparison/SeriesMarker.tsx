import { seriesAt, type SeriesShape } from './comparison-series';

const SHAPES: Record<SeriesShape, string> = {
  circle: 'M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1Z',
  triangle: 'M6 1 11 11H1Z',
  square: 'M1.5 1.5h9v9h-9Z',
  diamond: 'M6 0.5 11.5 6 6 11.5 0.5 6Z',
};

/** The same color and shape the charts use for this column. Decorative: names are in text. */
export function SeriesMarker({ index }: { index: number }) {
  const series = seriesAt(index);
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      className={`size-3 shrink-0 ${series.fillClass}`}
    >
      <path d={SHAPES[series.shape]} />
    </svg>
  );
}
