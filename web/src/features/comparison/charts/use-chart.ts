import type { ChartConfiguration, ChartType, DefaultDataPoint } from 'chart.js';
import { useEffect, useRef, type RefObject } from 'react';
import { useTheme } from '../../../app/theme/theme-context';
import { Chart } from './chart-setup';
import { readChartColors, type ChartColors } from './chart-theme';

export type ChartBuilder<
  TType extends ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = string,
> = (colors: ChartColors) => ChartConfiguration<TType, TData, TLabel>;

/**
 * Owns a Chart.js instance for a <canvas>: creates it after mount, rebuilds it when the data
 * (a new `build` function) or the theme change, and destroys it on unmount. Destroying in the
 * cleanup also makes it safe under StrictMode, which mounts effects twice in development.
 * `build` must be memoized (useCallback), or the chart would be rebuilt on every render.
 */
export function useChart<TType extends ChartType, TData = DefaultDataPoint<TType>, TLabel = string>(
  build: ChartBuilder<TType, TData, TLabel>,
): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Colors are read here, not during render: the theme reaches <html> in a layout effect
    const chart = new Chart(canvas, build(readChartColors()));
    return () => {
      chart.destroy();
    };
  }, [build, theme]);

  return canvasRef;
}
