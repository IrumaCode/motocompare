import type { ComparedMotorcycle } from './compare-query';
import { MetricBarCharts } from './charts/MetricBarCharts';
import { RadarChart } from './charts/RadarChart';

export function ComparisonCharts({ motorcycles }: { motorcycles: readonly ComparedMotorcycle[] }) {
  return (
    <section aria-labelledby="charts-heading" className="flex flex-col gap-3">
      <h2 id="charts-heading" className="text-xl font-semibold">
        Gráficos
      </h2>
      <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
        <RadarChart motorcycles={motorcycles} />
        <MetricBarCharts motorcycles={motorcycles} />
      </div>
    </section>
  );
}
