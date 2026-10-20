import { TrophyIcon } from '@phosphor-icons/react';
import { formatCop, formatNumber } from '../../lib/format';
import {
  COOLING_LABELS,
  ENGINE_TYPE_LABELS,
  TRANSMISSION_LABELS,
} from '../motorcycles/spec-labels';
import type { ComparedMotorcycle } from './compare-query';
import { bestFlags, METRICS, type ComparisonMetric } from './comparison-metrics';
import { SeriesMarker } from './SeriesMarker';

interface TableRow {
  label: string;
  cells: string[];
  best: boolean[];
}

interface TableGroup {
  title: string;
  rows: TableRow[];
}

type Motorcycles = readonly ComparedMotorcycle[];

const atRpm = (rpm: number) => ` a ${formatNumber(rpm)} rpm`;

function metricRow(
  metric: ComparisonMetric,
  motorcycles: Motorcycles,
  suffix: (motorcycle: ComparedMotorcycle) => string = () => '',
): TableRow {
  return {
    label: metric.label,
    cells: motorcycles.map((motorcycle) => {
      const value = metric.value(motorcycle);
      return value === null ? 'Sin dato oficial' : metric.format(value) + suffix(motorcycle);
    }),
    best: bestFlags(metric, motorcycles),
  };
}

function textRow(
  label: string,
  motorcycles: Motorcycles,
  text: (motorcycle: ComparedMotorcycle) => string,
): TableRow {
  return { label, cells: motorcycles.map(text), best: motorcycles.map(() => false) };
}

function toTableGroups(motorcycles: Motorcycles): TableGroup[] {
  return [
    {
      title: 'Rendimiento',
      rows: [
        metricRow(METRICS.powerHp, motorcycles, (m) => atRpm(m.powerRpm)),
        metricRow(METRICS.torqueNm, motorcycles, (m) => atRpm(m.torqueRpm)),
        metricRow(METRICS.powerToWeight, motorcycles),
      ],
    },
    {
      title: 'Motor',
      rows: [
        metricRow(METRICS.displacementCc, motorcycles),
        textRow('Configuración', motorcycles, (m) => ENGINE_TYPE_LABELS[m.engineType]),
        textRow('Refrigeración', motorcycles, (m) => COOLING_LABELS[m.cooling]),
      ],
    },
    {
      title: 'Transmisión',
      rows: [
        textRow('Tipo', motorcycles, (m) => TRANSMISSION_LABELS[m.transmission]),
        // A CVT has no discrete gears
        textRow('Marchas', motorcycles, (m) => (m.gears === null ? 'No aplica' : String(m.gears))),
      ],
    },
    {
      title: 'Chasis y dimensiones',
      rows: [
        metricRow(METRICS.weightKg, motorcycles),
        metricRow(METRICS.seatHeightMm, motorcycles),
        metricRow(METRICS.fuelCapacityL, motorcycles),
      ],
    },
    {
      title: 'Precio',
      rows: [
        metricRow(METRICS.priceUsd, motorcycles),
        textRow('Aprox. en pesos (TRM de hoy)', motorcycles, (m) =>
          m.priceCop === null ? 'Sin dato' : formatCop(m.priceCop),
        ),
      ],
    },
  ];
}

// The label column stays visible while the motorcycle columns scroll sideways on phones
const STICKY_CELL = 'sticky left-0 z-[1] bg-surface';

/**
 * Full specs side by side. The best value of each row is marked with an icon and hidden text,
 * not only with color or weight.
 */
export function SpecComparisonTable({ motorcycles }: { motorcycles: Motorcycles }) {
  const groups = toTableGroups(motorcycles);
  const columnCount = motorcycles.length + 1;

  return (
    <section aria-labelledby="spec-table-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="spec-table-heading" className="text-xl font-semibold">
          Ficha técnica
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <TrophyIcon size={16} className="text-accent-ink" />
          Mejor valor de cada fila
        </p>
      </div>

      {/* Focusable so keyboard users can scroll the table sideways. `relative`: the sr-only texts
          (absolute) must take it as containing block, or they escape the clipping and widen the page */}
      <div
        role="region"
        aria-labelledby="spec-table-heading"
        tabIndex={0}
        className="relative overflow-x-auto rounded-2xl border border-line bg-surface"
      >
        <table
          className="w-full border-collapse text-sm"
          // 9rem for the labels plus 9rem per motorcycle before scrolling kicks in
          style={{ minWidth: `${String(9 + motorcycles.length * 9)}rem` }}
        >
          <thead>
            <tr className="border-b border-line">
              <td className={`${STICKY_CELL} w-36`} />
              {motorcycles.map((motorcycle, index) => (
                <th key={motorcycle.id} scope="col" className="p-3 text-left align-bottom">
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-accent-ink uppercase">
                    <SeriesMarker index={index} />
                    {motorcycle.brand.name}
                  </span>
                  <span className="mt-0.5 block text-base font-semibold">{motorcycle.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={columnCount}
                  className="bg-surface-2/60 px-3 py-2 text-left text-xs font-semibold tracking-widest text-ink-muted uppercase"
                >
                  <span className="sticky left-3">{group.title}</span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-line first:border-t-0">
                  <th
                    scope="row"
                    className={`${STICKY_CELL} p-3 text-left font-normal text-ink-muted`}
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, index) => (
                    <td
                      key={motorcycles[index]?.id ?? index}
                      className={`p-3 tabular-nums ${row.best[index] ? 'font-semibold' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {cell}
                        {row.best[index] && (
                          <>
                            <TrophyIcon size={16} className="shrink-0 text-accent-ink" />
                            <span className="sr-only">(mejor valor)</span>
                          </>
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
