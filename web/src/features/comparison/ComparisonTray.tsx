import { useDroppable } from '@dnd-kit/core';
import { ArrowRightIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { Link, useMatch } from 'react-router';
import { MotoIllustration } from '../../components/MotoIllustration';
import { Button } from '../../components/ui/Button';
import { buttonClassName } from '../../components/ui/button-styles';
import { useComparison } from './comparison-context';
import { TRAY_DROP_ID } from './comparison-dnd';
import { COMPARE_PATH, toCompareHref } from './compare-url';
import { COMPARE_MAX, COMPARE_MIN, itemName, type ComparisonItem } from './comparison-selection';

function TrayChip({ item, onRemove }: { item: ComparisonItem; onRemove: () => void }) {
  return (
    <li className="flex shrink-0 items-center rounded-full border border-line bg-surface pl-3 text-sm whitespace-nowrap">
      <span className="text-ink-muted">{item.brandName}</span>&nbsp;
      <span className="font-semibold">{item.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${itemName(item)} de la comparación`}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:text-ink"
      >
        <XIcon size={16} />
      </button>
    </li>
  );
}

/** Placeholder for each free place, so the 4-motorcycle limit is visible at a glance. */
function EmptySlot() {
  return (
    <li
      aria-hidden="true"
      className="hidden h-11 w-16 shrink-0 rounded-full border-2 border-dashed border-line sm:block"
    />
  );
}

/**
 * Sticky bar with the motorcycles waiting to be compared. It is the last element of the page
 * wrapper, so at the end of the page it rests below the footer instead of covering content.
 */
export function ComparisonTray() {
  const { items, remove, clear } = useComparison();
  const onComparePage = useMatch(COMPARE_PATH) !== null;
  const { setNodeRef, isOver, active } = useDroppable({ id: TRAY_DROP_ID });
  const isDragging = active !== null;

  // While a card is being dragged the tray also shows when empty: it is the drop zone
  if ((items.length === 0 && !isDragging) || onComparePage) {
    return null;
  }

  const canCompare = items.length >= COMPARE_MIN;
  const freeSlots = COMPARE_MAX - items.length;

  return (
    <aside
      ref={setNodeRef}
      aria-label="Bandeja de comparación"
      data-comparison-tray
      className={`sticky bottom-0 z-10 border-t backdrop-blur transition-colors duration-200 ${
        isOver
          ? 'border-accent bg-surface/95 ring-2 ring-accent ring-inset'
          : 'border-line bg-canvas/95'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        {/* Phones: counter and buttons share the first row, chips scroll below.
            From sm, `contents` dissolves this row so everything fits in one line (order-*). */}
        <div className="flex items-center gap-2 sm:contents">
          <div className="flex items-center gap-2 sm:order-first">
            <MotoIllustration variant="mark" className="h-6 w-10 shrink-0" />
            <p role="status" className="text-sm font-semibold whitespace-nowrap tabular-nums">
              {items.length} de {COMPARE_MAX}
              <span className="sr-only"> motos en la comparación</span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:order-last sm:ml-0">
            <Button
              variant="ghost"
              onClick={clear}
              aria-label="Vaciar la comparación"
              size="compact"
            >
              <TrashIcon size={18} />
            </Button>
            {canCompare ? (
              <Link
                to={toCompareHref(items.map(({ slug }) => slug))}
                className={buttonClassName('primary', 'whitespace-nowrap')}
              >
                Ver comparación
                <ArrowRightIcon size={16} />
              </Link>
            ) : (
              <Button disabled aria-describedby="tray-hint" className="whitespace-nowrap">
                Ver comparación
              </Button>
            )}
          </div>
        </div>

        <ul aria-label="Motos elegidas" className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {items.map((item) => (
            <TrayChip
              key={item.slug}
              item={item}
              onRemove={() => {
                remove(item.slug);
              }}
            />
          ))}
          {Array.from({ length: freeSlots }, (_, index) => (
            <EmptySlot key={index} />
          ))}
        </ul>
        {isDragging ? (
          <p className="text-sm font-semibold text-accent-ink">Suelta aquí para compararla</p>
        ) : (
          !canCompare && (
            <p id="tray-hint" className="text-xs text-ink-muted">
              Añade al menos {COMPARE_MIN} motos para compararlas.
            </p>
          )
        )}
      </div>
    </aside>
  );
}
