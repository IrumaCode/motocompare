import type { ReactNode } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatNumber } from '../../lib/format';

interface StatsStripProps {
  motorcycles: number;
  brands: number;
  categories: number;
}

const GRID_CLASSES = 'grid grid-cols-3 gap-3 sm:gap-4';

function StatBox({ children }: { children: ReactNode }) {
  return (
    // column-reverse: the label comes first for screen readers, the number shows on top
    <div className="flex flex-col-reverse rounded-2xl border border-line bg-surface p-4 sm:p-5">
      {children}
    </div>
  );
}

export function StatsStrip({ motorcycles, brands, categories }: StatsStripProps) {
  const stats = [
    { label: 'motos', value: motorcycles },
    { label: 'marcas', value: brands },
    { label: 'categorías', value: categories },
  ];

  return (
    <dl className={GRID_CLASSES}>
      {stats.map(({ label, value }) => (
        <StatBox key={label}>
          <dt className="text-sm text-ink-muted">{label}</dt>
          <dd className="font-mono text-2xl font-bold tabular-nums sm:text-3xl">
            {formatNumber(value)}
          </dd>
        </StatBox>
      ))}
    </dl>
  );
}

export function StatsStripSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {['motorcycles', 'brands', 'categories'].map((key) => (
        <StatBox key={key}>
          <Skeleton className="mt-1 h-5 w-16" />
          <Skeleton className="h-8 w-12 sm:h-9" />
        </StatBox>
      ))}
    </div>
  );
}
