import { EngineIcon, LightningIcon, ScalesIcon, type Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import type { DocumentType } from '../../generated/graphql';
import { formatCop, formatNumber, formatUsd } from '../../lib/format';
import type { motorcycleCardFragment } from './motorcycle-card-fragment';
import { MotorcyclePhoto } from './MotorcyclePhoto';

type MotorcycleCardData = DocumentType<typeof motorcycleCardFragment>;

function Spec({ icon: SpecIcon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-ink-muted">
        <SpecIcon size={14} />
        {label}
      </dt>
      <dd className="font-mono text-sm font-semibold tabular-nums">{value}</dd>
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

/**
 * The whole card is clickable, but only the title is a real link: its ::after covers the card
 * ("stretched link"), so screen readers hear one short link instead of the whole card content.
 */
export function MotorcycleCard({
  motorcycle,
  actions,
}: {
  motorcycle: MotorcycleCardData;
  /** Controls next to the price; they sit above the stretched link so they stay clickable. */
  actions?: ReactNode;
}) {
  const location = useLocation();

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-200 hover:border-ink-muted has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent-ink">
      <div className="relative">
        <MotorcyclePhoto image={motorcycle.image} alt="" />
        <span className="absolute top-3 left-3 rounded-full bg-canvas/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {motorcycle.category.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-widest text-accent-ink uppercase">
          {motorcycle.brand.name}
        </p>
        <h3 className="mt-1 text-lg font-semibold">
          <Link
            to={`/motos/${motorcycle.slug}`}
            // Lets the detail page go back to this exact list, filters included
            state={{ backTo: location.pathname + location.search }}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {motorcycle.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-muted">{motorcycle.year}</p>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <Spec
            icon={EngineIcon}
            label="Motor"
            value={`${formatNumber(motorcycle.displacementCc)} cc`}
          />
          <Spec
            icon={LightningIcon}
            label="Potencia"
            value={`${formatNumber(motorcycle.powerHp)} hp`}
          />
          <Spec icon={ScalesIcon} label="Peso" value={`${formatNumber(motorcycle.weightKg)} kg`} />
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
            <Price priceUsd={motorcycle.priceUsd} priceCop={motorcycle.priceCop} />
            {actions && <div className="relative z-[1] flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>
    </article>
  );
}
