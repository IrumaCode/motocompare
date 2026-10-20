import { MotoIllustration, type SpeedLevel } from '../../components/MotoIllustration';
import { formatNumber } from '../../lib/format';

interface PowerMeterProps {
  powerHp: number;
  /** Share (0-100) of the other catalog motorcycles with less power */
  powerPercentile: number;
}

/** Thirds of the catalog: bottom third 1 line, middle 2, top 3. */
function speedLevelFor(percentile: number): SpeedLevel {
  if (percentile < 34) return 1;
  if (percentile < 67) return 2;
  return 3;
}

function rankText(percentile: number): string {
  if (percentile >= 100) return 'La más potente del catálogo';
  if (percentile <= 0) return 'La menos potente del catálogo';
  return `Más potente que el ${formatNumber(Math.round(percentile))} % del catálogo`;
}

/** The drawing is decorative: the visible text carries the same information. */
export function PowerMeter({ powerHp, powerPercentile }: PowerMeterProps) {
  return (
    <section
      aria-labelledby="power-meter-heading"
      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
    >
      <MotoIllustration
        variant="static"
        speedLevel={speedLevelFor(powerPercentile)}
        className="h-16 w-28 shrink-0"
      />
      <div>
        <h2 id="power-meter-heading" className="text-sm text-ink-muted">
          Potencia frente al catálogo
        </h2>
        <p className="font-mono text-lg font-semibold tabular-nums">{formatNumber(powerHp)} hp</p>
        <p className="text-sm">{rankText(powerPercentile)}</p>
      </div>
    </section>
  );
}
