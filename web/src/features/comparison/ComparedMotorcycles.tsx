import { XIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { MotorcyclePhoto } from '../motorcycles/MotorcyclePhoto';
import type { ComparedMotorcycle } from './compare-query';
import { SeriesMarker } from './SeriesMarker';

interface ComparedMotorcyclesProps {
  motorcycles: readonly ComparedMotorcycle[];
  onRemove: (slug: string) => void;
}

/** One column per motorcycle: photo, name (with its chart marker) and a remove button. */
export function ComparedMotorcycles({ motorcycles, onRemove }: ComparedMotorcyclesProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-flow-col md:grid-cols-none md:auto-cols-fr">
      {motorcycles.map((motorcycle, index) => (
        <li
          key={motorcycle.id}
          className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <MotorcyclePhoto image={motorcycle.image} alt="" />
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-accent-ink uppercase">
                <SeriesMarker index={index} />
                {motorcycle.brand.name}
              </p>
              <Link
                to={`/motos/${motorcycle.slug}`}
                className="font-semibold underline-offset-4 hover:underline"
              >
                {motorcycle.name}
              </Link>
              <p className="text-xs text-ink-muted">
                {motorcycle.category.name} · {motorcycle.year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onRemove(motorcycle.slug);
              }}
              className="mt-auto inline-flex min-h-11 cursor-pointer items-center gap-1.5 self-start rounded-lg text-sm font-semibold text-ink-muted hover:text-ink"
            >
              <XIcon size={16} />
              Quitar
              <span className="sr-only">
                {' '}
                {motorcycle.brand.name} {motorcycle.name}
              </span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
