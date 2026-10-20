import { CombinedGraphQLErrors } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { NotFoundPage } from '../../app/NotFoundPage';
import { ColdStartNotice } from '../../components/ColdStartNotice';
import { MotoIllustration } from '../../components/MotoIllustration';
import { buttonClassName } from '../../components/ui/button-styles';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSlowLoading } from '../../lib/use-slow-loading';
import { compareQuery, type ComparedMotorcycle } from './compare-query';
import { ComparedMotorcycles } from './ComparedMotorcycles';
import { useComparison } from './comparison-context';
import { COMPARE_MIN, slugsFromSearchParams, toCompareHref } from './comparison-selection';
import { PowerToWeightRace } from './PowerToWeightRace';
import { SpecComparisonTable } from './SpecComparisonTable';

const CATALOG_PATH = '/motos';

/** The API rejects unknown slugs with BAD_USER_INPUT: the link is wrong, retrying won't help. */
function isInvalidLink(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((graphQLError) => graphQLError.extensions?.code === 'BAD_USER_INPUT')
  );
}

function NotEnoughMotorcycles() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-12 text-center">
      <MotoIllustration variant="static" className="h-20 w-36 opacity-80" />
      <h2 className="text-lg font-semibold">Elige al menos {COMPARE_MIN} motos</h2>
      <p className="max-w-md text-ink-muted">
        En el catálogo, pulsa «Comparar» en cada moto o arrástrala a la bandeja de abajo.
      </p>
      <Link to={CATALOG_PATH} className={buttonClassName('primary')}>
        Ir al catálogo
      </Link>
    </section>
  );
}

function CompareSkeleton({ isSlow, count }: { isSlow: boolean; count: number }) {
  return (
    <div role="status" className="flex flex-col gap-8">
      {isSlow ? <ColdStartNotice /> : <span className="sr-only">Cargando la comparación…</span>}
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 md:grid-flow-col md:grid-cols-none">
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
      <div aria-hidden="true">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

function CompareContent({ motorcycles }: { motorcycles: readonly ComparedMotorcycle[] }) {
  const navigate = useNavigate();
  const { remove } = useComparison();

  const removeColumn = (slug: string) => {
    // Keep the tray in step: a motorcycle removed here should not come back from the tray
    remove(slug);
    void navigate(toCompareHref(motorcycles.map((m) => m.slug).filter((s) => s !== slug)));
  };

  return (
    <div className="flex flex-col gap-10">
      <ComparedMotorcycles motorcycles={motorcycles} onRemove={removeColumn} />
      <PowerToWeightRace motorcycles={motorcycles} />
      <SpecComparisonTable motorcycles={motorcycles} />
    </div>
  );
}

export function ComparePage() {
  const [searchParams] = useSearchParams();
  const slugs = slugsFromSearchParams(searchParams);
  const hasEnough = slugs.length >= COMPARE_MIN;

  const { data, loading, error, refetch } = useQuery(compareQuery, {
    variables: { slugs },
    skip: !hasEnough,
  });
  const isSlow = useSlowLoading(loading && !data);

  // A whole page of its own (with its h1), like the detail page does for an unknown slug
  if (error && !loading && isInvalidLink(error)) {
    return (
      <NotFoundPage
        title="Alguna moto del enlace no existe"
        message="Puede que el enlace esté incompleto o que una moto ya no esté en el catálogo."
        action={{ to: CATALOG_PATH, label: 'Ver catálogo' }}
      />
    );
  }

  function renderContent() {
    if (!hasEnough) return <NotEnoughMotorcycles />;
    if (error && !loading) {
      return (
        <ErrorState
          message="No pudimos cargar la comparación. Inténtalo de nuevo en unos segundos."
          onRetry={() => void refetch()}
        />
      );
    }
    if (!data) return <CompareSkeleton isSlow={isSlow} count={slugs.length} />;
    return <CompareContent motorcycles={data.compare} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <title>Comparación · MotoCompare</title>
      <header>
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Comparación</h1>
        <p className="mt-2 text-ink-muted">
          Potencia, peso y precio lado a lado. Comparte el enlace de esta página para mostrar la
          misma comparación.
        </p>
      </header>
      {renderContent()}
    </div>
  );
}
