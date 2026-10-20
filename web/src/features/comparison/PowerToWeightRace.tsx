import { TrophyIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { MotoIllustration } from '../../components/MotoIllustration';
import type { ComparedMotorcycle } from './compare-query';
import { bestFlags, METRICS, scores } from './comparison-metrics';
import { seriesAt } from './comparison-series';
import { SeriesMarker } from './SeriesMarker';

const METRIC = METRICS.powerToWeight;

/** Room reserved at the end of the track for the bike drawing (Tailwind w-12). */
const BIKE_SPACE = '3rem';

/**
 * Track drawing, decorative (the text above it carries the data). The bike rides inside a box
 * one bike narrower than the track, so moving it by `progress` × 100% of that box stops the
 * winner right at the finish. The trail behind it is the bar that remains: with reduced motion
 * nothing moves and the final positions read as plain bars.
 */
function Track({ progress, seriesIndex }: { progress: number; seriesIndex: number }) {
  const trail: CSSProperties = {
    width: `calc(${String(progress)} * (100% - ${BIKE_SPACE}) + ${BIKE_SPACE} / 2)`,
  };
  const bike: CSSProperties = { translate: `${String(progress * 100)}% 0` };

  return (
    <div aria-hidden="true" className="relative h-10 overflow-hidden rounded-full bg-surface-2">
      <div
        style={trail}
        className={`absolute top-1/2 left-0 h-1.5 -translate-y-1/2 origin-left rounded-full ${seriesAt(seriesIndex).bgClass} motion-safe:animate-race-trail`}
      />
      <div className="absolute inset-y-0 right-12 left-0">
        <div style={bike} className="flex h-full items-center motion-safe:animate-race">
          <MotoIllustration variant="mark" className="h-6 w-10 shrink-0" />
        </div>
      </div>
    </div>
  );
}

/** Power-to-weight "race": how many horsepower each kilo of motorcycle carries. */
export function PowerToWeightRace({ motorcycles }: { motorcycles: readonly ComparedMotorcycle[] }) {
  const progress = scores(METRIC, motorcycles);
  const best = bestFlags(METRIC, motorcycles);

  return (
    <section aria-labelledby="race-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="race-heading" className="text-xl font-semibold">
          Carrera de potencia por kilo
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Cuántos caballos de fuerza mueve cada kilo de moto. Cuanto más alto, más rápido acelera.
        </p>
      </div>
      <ol className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        {motorcycles.map((motorcycle, index) => (
          <li key={motorcycle.id} className="flex flex-col gap-1.5">
            <p className="flex flex-wrap items-center gap-x-2 text-sm">
              <SeriesMarker index={index} />
              <span>
                <span className="text-ink-muted">{motorcycle.brand.name}</span>{' '}
                <span className="font-semibold">{motorcycle.name}</span>
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums">
                {METRIC.format(METRIC.value(motorcycle) ?? 0)}
                {best[index] && (
                  <>
                    <TrophyIcon size={16} className="text-accent-ink" />
                    <span className="sr-only">(la mejor)</span>
                  </>
                )}
              </span>
            </p>
            <Track progress={progress[index] ?? 0} seriesIndex={index} />
          </li>
        ))}
      </ol>
    </section>
  );
}
