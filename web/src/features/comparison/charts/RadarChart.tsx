import type { PointStyle } from 'chart.js';
import { useCallback, useMemo } from 'react';
import type { ComparedMotorcycle } from '../compare-query';
import { METRICS, scores, type ComparisonMetric } from '../comparison-metrics';
import { seriesAt, type SeriesShape } from '../comparison-series';
import { withAlpha } from './chart-theme';
import { useChart, type ChartBuilder } from './use-chart';

// Six axes where "better" has a clear direction. Displacement and seat height stay out:
// neither more nor less is better, so they only appear in the table.
const BASE_AXES: readonly ComparisonMetric[] = [
  METRICS.powerHp,
  METRICS.torqueNm,
  METRICS.powerToWeight,
  METRICS.weightKg,
  METRICS.fuelCapacityL,
];

const POINT_STYLES: Record<SeriesShape, PointStyle> = {
  circle: 'circle',
  triangle: 'triangle',
  square: 'rect',
  diamond: 'rectRot',
};

/** "Potencia por kilo" -> ["Potencia", "por kilo"]: two short lines fit narrow screens. */
function axisLabel(metric: ComparisonMetric): string | string[] {
  const label = metric.scoreLabel ?? metric.label;
  const firstSpace = label.indexOf(' ');
  return firstSpace === -1 ? label : [label.slice(0, firstSpace), label.slice(firstSpace + 1)];
}

const fullName = (motorcycle: ComparedMotorcycle) => `${motorcycle.brand.name} ${motorcycle.name}`;

/** A price axis is only fair when every motorcycle has an official price. */
function radarAxes(motorcycles: readonly ComparedMotorcycle[]): readonly ComparisonMetric[] {
  const allPriced = motorcycles.every((motorcycle) => motorcycle.priceUsd !== null);
  return allPriced ? [...BASE_AXES, METRICS.priceUsd] : BASE_AXES;
}

/**
 * Each axis scores the motorcycles against the best one of this comparison (100 %), so the
 * shapes answer "which one wins here, and by how much". Tooltips show the real values.
 */
export function RadarChart({ motorcycles }: { motorcycles: readonly ComparedMotorcycle[] }) {
  // Memoized: a new array on every render would rebuild the chart on every render
  const axes = useMemo(() => radarAxes(motorcycles), [motorcycles]);
  const hasPriceAxis = axes.includes(METRICS.priceUsd);

  const build = useCallback<ChartBuilder<'radar', (number | null)[], string | string[]>>(
    (colors) => {
      const axisScores = axes.map((metric) => scores(metric, motorcycles));
      return {
        type: 'radar',
        data: {
          labels: axes.map(axisLabel),
          datasets: motorcycles.map((motorcycle, index) => {
            const series = seriesAt(index);
            const color = colors.series[index] ?? colors.ink;
            return {
              label: fullName(motorcycle),
              data: axisScores.map((perMotorcycle) => {
                const score = perMotorcycle[index];
                return score == null ? null : Math.round(score * 100);
              }),
              borderColor: color,
              backgroundColor: withAlpha(color, 0.12),
              borderWidth: 2,
              borderDash: series.lineDash,
              pointStyle: POINT_STYLES[series.shape],
              pointBackgroundColor: color,
              pointRadius: 4,
              pointHoverRadius: 6,
            };
          }),
        },
        options: {
          maintainAspectRatio: false,
          animation: colors.reduceMotion ? false : undefined,
          layout: { padding: 8 },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false, stepSize: 25 },
              grid: { color: colors.line },
              angleLines: { color: colors.line },
              pointLabels: { color: colors.ink, font: { size: 12, weight: 600 } },
            },
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: colors.ink,
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                padding: 16,
              },
            },
            tooltip: {
              backgroundColor: colors.surface,
              titleColor: colors.ink,
              bodyColor: colors.ink,
              borderColor: colors.line,
              borderWidth: 1,
              usePointStyle: true,
              callbacks: {
                label: ({ datasetIndex, dataIndex, formattedValue }) => {
                  const motorcycle = motorcycles[datasetIndex];
                  const metric = axes[dataIndex];
                  const value = motorcycle && metric ? metric.value(motorcycle) : null;
                  if (!motorcycle || value === null || !metric) return '';
                  return `${fullName(motorcycle)}: ${metric.format(value)} (${formattedValue} %)`;
                },
              },
            },
          },
        },
      };
    },
    [axes, motorcycles],
  );
  const canvasRef = useChart(build);

  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <figcaption>
        <h3 className="font-semibold">Perfil de cada moto</h3>
        <p className="mt-1 text-sm text-ink-muted">
          En cada eje, la mejor de la comparación marca 100 %.
          {!hasPriceAxis && ' El precio no aparece porque alguna moto no tiene precio oficial.'}
        </p>
      </figcaption>
      <div className="relative h-80 sm:h-96">
        {/* The exact numbers are in the table below: the canvas only needs a summary */}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Gráfico de radar que compara ${motorcycles.map(fullName).join(', ')} en ${axes
            .map((metric) => (metric.scoreLabel ?? metric.label).toLowerCase())
            .join(', ')}. Los valores exactos están en la ficha técnica.`}
        />
      </div>
    </figure>
  );
}
