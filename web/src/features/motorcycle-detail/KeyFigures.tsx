import {
  EngineIcon,
  LightningIcon,
  ScalesIcon,
  WrenchIcon,
  type Icon,
} from '@phosphor-icons/react';
import { formatNumber } from '../../lib/format';

interface KeyFiguresProps {
  powerHp: number;
  torqueNm: number;
  weightKg: number;
  displacementCc: number;
}

function Figure({
  icon: FigureIcon,
  label,
  value,
  unit,
}: {
  icon: Icon;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    // column-reverse: the label comes first for screen readers, the number shows on top
    <div className="flex flex-col-reverse rounded-2xl border border-line bg-surface p-4">
      <dt className="flex items-center gap-1.5 text-sm text-ink-muted">
        <FigureIcon size={16} />
        {label}
      </dt>
      <dd className="font-mono text-2xl font-bold tabular-nums">
        {formatNumber(value)} <span className="text-base font-semibold text-ink-muted">{unit}</span>
      </dd>
    </div>
  );
}

/** The four numbers people compare first, in big type. */
export function KeyFigures({ powerHp, torqueNm, weightKg, displacementCc }: KeyFiguresProps) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      <Figure icon={LightningIcon} label="Potencia" value={powerHp} unit="hp" />
      <Figure icon={WrenchIcon} label="Torque" value={torqueNm} unit="Nm" />
      <Figure icon={ScalesIcon} label="Peso" value={weightKg} unit="kg" />
      <Figure icon={EngineIcon} label="Cilindrada" value={displacementCc} unit="cc" />
    </dl>
  );
}
