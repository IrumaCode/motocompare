import { useQuery } from '@apollo/client/react';
import { ColdStartNotice } from '../../components/ColdStartNotice';
import { ErrorState } from '../../components/ui/ErrorState';
import { graphql } from '../../generated/graphql';
import { useSlowLoading } from '../../lib/use-slow-loading';
import { MotorcycleCard } from '../motorcycles/MotorcycleCard';
import { MotorcycleCardSkeleton } from '../motorcycles/MotorcycleCardSkeleton';
import { HomeHero } from './HomeHero';
import { StatsStrip, StatsStripSkeleton } from './StatsStrip';

const FEATURED_COUNT = 6;

// One query for the whole page: a single round trip and a single loading/error state
const homePageQuery = graphql(`
  query HomePage($featuredCount: Int!) {
    motorcycles(sort: { field: POWER_HP, direction: DESC }, pageSize: $featuredCount) {
      totalCount
      items {
        id
        ...MotorcycleCard
      }
    }
    brands {
      id
    }
    categories {
      id
    }
  }
`);

const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

function HomeSkeleton({ isSlow }: { isSlow: boolean }) {
  return (
    // role="status" makes screen readers announce the text inside it
    <div role="status" aria-busy="true" className="flex flex-col gap-10">
      {isSlow ? <ColdStartNotice /> : <span className="sr-only">Cargando motos…</span>}
      <div aria-hidden="true" className="flex flex-col gap-10">
        <StatsStripSkeleton />
        <div className={GRID_CLASSES}>
          {Array.from({ length: FEATURED_COUNT }, (_, index) => (
            <MotorcycleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const { data, loading, error, refetch } = useQuery(homePageQuery, {
    variables: { featuredCount: FEATURED_COUNT },
  });
  const isSlow = useSlowLoading(loading && !data);

  if (data) {
    return (
      <div className="flex flex-col gap-10">
        <StatsStrip
          motorcycles={data.motorcycles.totalCount}
          brands={data.brands.length}
          categories={data.categories.length}
        />
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="mb-4 text-xl font-semibold">
            Las más potentes
          </h2>
          <div className={GRID_CLASSES}>
            {data.motorcycles.items.map((motorcycle) => (
              <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // On retry Apollo sets `loading` again, so the skeleton replaces the error meanwhile
  if (error && !loading) {
    return (
      <ErrorState
        message="No pudimos cargar las motos. Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => void refetch()}
      />
    );
  }

  // First load can be slow when the API or the database are waking up
  return <HomeSkeleton isSlow={isSlow} />;
}

export function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeContent />
    </>
  );
}
