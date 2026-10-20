import { useCallback } from 'react';
import { formatNumber } from '../../../lib/format';
import type { ComparedMotorcycle } from '../compare-query';
import { METRICS, type ComparisonMetric } from '../comparison-metrics';
import { useChart, type ChartBuilder } from './use-chart';

// Real values (not scores), one small chart per metric: each keeps its own unit and scale.
const BAR_METRICS: readonly ComparisonMetric[] = [
  METRICS.powerHp,
  METRICS.torqueNm,
  METRICS.weightKg,
  METRICS.priceUsd,
];

const DIRECTION_HINT = { higher: 'más es mejor', lower: 'menos es mejor' } as const;

interface MetricBarChartProps {
  metric: ComparisonMetric;
  motorcycles: readonly ComparedMotorcycle[];
}

function MetricBarChart({ metric, motorcycles }: MetricBarChartProps) {
  const build = useCallback<ChartBuilder<'bar', (number | null)[]>>(
    (colors) => ({
      type: 'bar',
      data: {
        labels: motorcycles.map((motorcycle) => motorcycle.name),
        datasets: [
          {
            label: metric.label,
            data: motorcycles.map(metric.value),
            backgroundColor: motorcycles.map((_, index) => colors.series[index] ?? colors.ink),
            borderRadius: 6,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        // Room for the first letter of the labels, which canvas otherwise clips at the edge
        layout: { padding: { left: 8, right: 8 } },
        animation: colors.reduceMotion ? false : undefined,
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: colors.line },
            border: { display: false },
            ticks: {
              color: colors.inkMuted,
              maxTicksLimit: 5,
              callback: (value) => formatNumber(Number(value)),
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.ink, font: { weight: 600 } },
          },
        },
        plugins: {
          // Each bar is labeled on the axis: no legend needed
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.surface,
            titleColor: colors.ink,
            bodyColor: colors.ink,
            borderColor: colors.line,
            borderWidth: 1,
            callbacks: {
              label: ({ raw }) =>
                typeof raw === 'number' ? metric.format(raw) : 'Sin dato oficial',
            },
          },
        },
      },
    }),
    [metric, motorcycles],
  );
  const canvasRef = useChart(build);

  const summary = motorcycles
    .map((motorcycle) => {
      const value = metric.value(motorcycle);
      return `${motorcycle.name}: ${value === null ? 'sin dato' : metric.format(value)}`;
    })
    .join(', ');

  return (
    <figure className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
      <figcaption className="text-sm">
        <span className="font-semibold">{metric.label}</span>
        {metric.direction && (
          <span className="text-ink-muted"> · {DIRECTION_HINT[metric.direction]}</span>
        )}
      </figcaption>
      {/* One bar per motorcycle: about 2.5rem each, plus room for the axis */}
      <div className="relative" style={{ height: `${String(2.5 * motorcycles.length + 2)}rem` }}>
        <canvas ref={canvasRef} role="img" aria-label={`${metric.label}. ${summary}.`} />
      </div>
    </figure>
  );
}

/** Small multiples: power, torque, weight and price, each on its own scale. */
export function MetricBarCharts({ motorcycles }: { motorcycles: readonly ComparedMotorcycle[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {BAR_METRICS.map((metric) => (
        <MetricBarChart key={metric.id} metric={metric} motorcycles={motorcycles} />
      ))}
    </div>
  );
}
