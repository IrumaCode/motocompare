import { CheckIcon, PlusIcon } from '@phosphor-icons/react';
import { useComparison } from './comparison-context';
import { FULL_TRAY_MESSAGE, type ComparisonItem } from './comparison-selection';

/**
 * Button alternative to dragging (WCAG 2.2 "Dragging movements"). A toggle button keeps the
 * same name and reports its state with aria-pressed, as the APG pattern recommends; only the
 * icon changes. The hidden part of the name tells the many "Comparar" buttons apart.
 */
export function CompareToggle({ item }: { item: ComparisonItem }) {
  const { isSelected, isFull, add, remove } = useComparison();
  const selected = isSelected(item.slug);
  const blocked = isFull && !selected;

  return (
    <button
      type="button"
      aria-pressed={selected}
      title={blocked ? FULL_TRAY_MESSAGE : undefined}
      disabled={blocked}
      onClick={() => {
        if (selected) remove(item.slug);
        else add(item);
      }}
      className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-ink transition duration-200 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent aria-pressed:hover:brightness-110"
    >
      {selected ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
      Comparar
      <span className="sr-only">
        {' '}
        {item.brandName} {item.name}
      </span>
    </button>
  );
}
