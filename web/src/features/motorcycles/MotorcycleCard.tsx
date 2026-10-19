import type { DocumentType } from '../../generated/graphql';
import { formatCop, formatNumber, formatUsd } from '../../lib/format';
import type { motorcycleCardFragment } from './motorcycle-card-fragment';

type MotorcycleCardData = DocumentType<typeof motorcycleCardFragment>;

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-mono text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Price({ priceUsd, priceCop }: Pick<MotorcycleCardData, 'priceUsd' | 'priceCop'>) {
  if (priceUsd === null) {
    return <p className="text-sm text-ink-muted">Precio no disponible</p>;
  }
  return (
    <div>
      <p className="font-mono text-lg font-semibold tabular-nums">{formatUsd(priceUsd)}</p>
      {priceCop !== null && (
        <p className="font-mono text-sm text-ink-muted tabular-nums">≈ {formatCop(priceCop)}</p>
      )}
    </div>
  );
}

export function MotorcycleCard({ motorcycle }: { motorcycle: MotorcycleCardData }) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold tracking-widest text-accent-ink uppercase">
        {motorcycle.brand.name}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{motorcycle.name}</h3>
      <p className="text-sm text-ink-muted">
        {motorcycle.category.name} · {motorcycle.year}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <Spec label="Cilindrada" value={`${formatNumber(motorcycle.displacementCc)} cc`} />
        <Spec label="Potencia" value={`${formatNumber(motorcycle.powerHp)} hp`} />
      </dl>

      <div className="mt-auto border-t border-line pt-4">
        <Price priceUsd={motorcycle.priceUsd} priceCop={motorcycle.priceCop} />
      </div>
    </article>
  );
}
