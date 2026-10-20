import {
  ArrowsVerticalIcon,
  EngineIcon,
  GasPumpIcon,
  GearSixIcon,
  LightningIcon,
  ScalesIcon,
  ThermometerIcon,
  WrenchIcon,
  type Icon,
} from '@phosphor-icons/react';
import { formatNumber } from '../../lib/format';
import {
  COOLING_LABELS,
  ENGINE_TYPE_LABELS,
  TRANSMISSION_LABELS,
} from '../motorcycles/spec-labels';
import type { MotorcycleDetail } from './motorcycle-detail-query';

interface SpecRow {
  icon: Icon;
  label: string;
  value: string;
}

interface SpecGroup {
  title: string;
  icon: Icon;
  rows: SpecRow[];
}

const atRpm = (value: string, rpm: number) => `${value} a ${formatNumber(rpm)} rpm`;

function toSpecGroups(motorcycle: MotorcycleDetail): SpecGroup[] {
  return [
    {
      title: 'Motor',
      icon: EngineIcon,
      rows: [
        {
          icon: EngineIcon,
          label: 'Cilindrada',
          value: `${formatNumber(motorcycle.displacementCc)} cc`,
        },
        {
          icon: EngineIcon,
          label: 'Configuración',
          value: ENGINE_TYPE_LABELS[motorcycle.engineType],
        },
        {
          icon: ThermometerIcon,
          label: 'Refrigeración',
          value: COOLING_LABELS[motorcycle.cooling],
        },
        {
          icon: LightningIcon,
          label: 'Potencia',
          value: atRpm(`${formatNumber(motorcycle.powerHp)} hp`, motorcycle.powerRpm),
        },
        {
          icon: WrenchIcon,
          label: 'Torque',
          value: atRpm(`${formatNumber(motorcycle.torqueNm)} Nm`, motorcycle.torqueRpm),
        },
      ],
    },
    {
      title: 'Transmisión',
      icon: GearSixIcon,
      rows: [
        { icon: GearSixIcon, label: 'Tipo', value: TRANSMISSION_LABELS[motorcycle.transmission] },
        {
          icon: GearSixIcon,
          label: 'Marchas',
          // A CVT has no discrete gears
          value: motorcycle.gears === null ? 'No aplica' : String(motorcycle.gears),
        },
      ],
    },
    {
      title: 'Chasis y dimensiones',
      icon: ScalesIcon,
      rows: [
        {
          icon: ScalesIcon,
          label: 'Peso en orden de marcha',
          value: `${formatNumber(motorcycle.weightKg)} kg`,
        },
        {
          icon: ArrowsVerticalIcon,
          label: 'Altura del asiento',
          value: `${formatNumber(motorcycle.seatHeightMm)} mm`,
        },
        {
          icon: GasPumpIcon,
          label: 'Depósito',
          value: `${formatNumber(motorcycle.fuelCapacityL)} L`,
        },
      ],
    },
  ];
}

export function SpecGroups({ motorcycle }: { motorcycle: MotorcycleDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {toSpecGroups(motorcycle).map(({ title, icon: GroupIcon, rows }) => (
        <section key={title} className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <GroupIcon className="text-accent-ink" />
            {title}
          </h2>
          <dl className="mt-4 flex flex-col gap-3">
            {rows.map(({ icon: RowIcon, label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3 text-sm">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  <RowIcon size={16} />
                  {label}
                </dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
