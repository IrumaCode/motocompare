import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Link target for a given page, so each page is a real, shareable URL */
  hrefFor: (page: number) => string;
}

const ITEM_CLASSES =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition duration-200';
const IDLE_CLASSES = 'border-line hover:bg-surface-2';
const CURRENT_CLASSES = 'border-accent bg-accent text-on-accent';

// Every page number is shown: 30 motorcycles make 3 pages, so no ellipsis logic (YAGNI)
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link
          to={hrefFor(page - 1)}
          aria-label="Página anterior"
          className={`${ITEM_CLASSES} ${IDLE_CLASSES}`}
        >
          <CaretLeftIcon />
        </Link>
      )}
      {pages.map((number) => (
        <Link
          key={number}
          to={hrefFor(number)}
          aria-current={number === page ? 'page' : undefined}
          aria-label={`Página ${String(number)}`}
          className={`${ITEM_CLASSES} ${number === page ? CURRENT_CLASSES : IDLE_CLASSES}`}
        >
          {number}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          to={hrefFor(page + 1)}
          aria-label="Página siguiente"
          className={`${ITEM_CLASSES} ${IDLE_CLASSES}`}
        >
          <CaretRightIcon />
        </Link>
      )}
    </nav>
  );
}
