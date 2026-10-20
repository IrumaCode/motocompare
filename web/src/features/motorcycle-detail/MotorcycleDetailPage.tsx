import { useQuery } from '@apollo/client/react';
import { ArrowLeftIcon, CurrencyDollarIcon } from '@phosphor-icons/react';
import { Link, useLocation, useParams } from 'react-router';
import { NotFoundPage } from '../../app/NotFoundPage';
import { ColdStartNotice } from '../../components/ColdStartNotice';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCop, formatUsd } from '../../lib/format';
import { useSlowLoading } from '../../lib/use-slow-loading';
import { MotorcyclePhoto } from '../motorcycles/MotorcyclePhoto';
import { KeyFigures } from './KeyFigures';
import { motorcycleDetailQuery, type MotorcycleDetail } from './motorcycle-detail-query';
import { PhotoCredit } from './PhotoCredit';
import { PowerMeter } from './PowerMeter';
import { SpecGroups } from './SpecGroups';

const CATALOG_PATH = '/motos';

/**
 * Where "Volver" goes: the list the user came from (filters included), sent by the card link.
 * Router state is `unknown` (anyone can push anything), so it is narrowed before use.
 */
function backPathFrom(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'backTo' in state) {
    const { backTo } = state;
    // Only same-app paths: never navigate to something like "//evil.example"
    if (typeof backTo === 'string' && backTo.startsWith('/') && !backTo.startsWith('//')) {
      return backTo;
    }
  }
  return CATALOG_PATH;
}

function Price({ priceUsd, priceCop }: Pick<MotorcycleDetail, 'priceUsd' | 'priceCop'>) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
      <CurrencyDollarIcon size={24} className="mt-0.5 text-accent-ink" />
      {priceUsd === null ? (
        <p className="text-ink-muted">Precio oficial no disponible</p>
      ) : (
        <div>
          <p className="text-sm text-ink-muted">Precio base en EE. UU.</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{formatUsd(priceUsd)}</p>
          {priceCop !== null && (
            <p className="font-mono text-sm text-ink-muted tabular-nums">
              ≈ {formatCop(priceCop)} con la TRM de hoy
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DetailContent({ motorcycle }: { motorcycle: MotorcycleDetail }) {
  const fullName = `${motorcycle.brand.name} ${motorcycle.name}`;

  return (
    <article className="flex flex-col gap-8">
      <title>{`${fullName} · MotoCompare`}</title>
      <header>
        <p className="text-xs font-semibold tracking-widest text-accent-ink uppercase">
          {motorcycle.brand.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-4xl">
          {motorcycle.name}
        </h1>
        <p className="mt-2 text-ink-muted">
          {motorcycle.category.name} · {motorcycle.year}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
          <MotorcyclePhoto image={motorcycle.image} alt={fullName} priority />
          {motorcycle.image ? (
            <PhotoCredit {...motorcycle.image} />
          ) : (
            <figcaption className="px-4 py-3 text-xs text-ink-muted">
              Aún no tenemos una foto con licencia libre de este modelo.
            </figcaption>
          )}
        </figure>

        <div className="flex flex-col gap-4">
          <KeyFigures
            powerHp={motorcycle.powerHp}
            torqueNm={motorcycle.torqueNm}
            weightKg={motorcycle.weightKg}
            displacementCc={motorcycle.displacementCc}
          />
          <Price priceUsd={motorcycle.priceUsd} priceCop={motorcycle.priceCop} />
          <PowerMeter powerHp={motorcycle.powerHp} powerPercentile={motorcycle.powerPercentile} />
        </div>
      </div>

      <SpecGroups motorcycle={motorcycle} />
    </article>
  );
}

function DetailSkeleton({ isSlow }: { isSlow: boolean }) {
  return (
    <div role="status" className="flex flex-col gap-8">
      {isSlow ? <ColdStartNotice /> : <span className="sr-only">Cargando la moto…</span>}
      <div aria-hidden="true" className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-9 w-56" />
          <Skeleton className="mt-3 h-4 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Skeleton className="aspect-[16/10] rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MotorcycleDetailPage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const { data, loading, error, refetch } = useQuery(motorcycleDetailQuery, {
    variables: { slug },
  });
  const isSlow = useSlowLoading(loading && !data);

  if (data && !data.motorcycle) {
    return (
      <NotFoundPage
        title="Moto no encontrada"
        message="Esta moto no está en el catálogo o su dirección cambió."
        action={{ to: CATALOG_PATH, label: 'Ver catálogo' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={backPathFrom(location.state)}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg text-sm font-semibold text-ink-muted hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        Volver
      </Link>
      {data?.motorcycle ? (
        <DetailContent motorcycle={data.motorcycle} />
      ) : error && !loading ? (
        <ErrorState
          message="No pudimos cargar esta moto. Inténtalo de nuevo en unos segundos."
          onRetry={() => void refetch()}
        />
      ) : (
        <DetailSkeleton isSlow={isSlow} />
      )}
    </div>
  );
}
