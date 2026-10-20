import { CheckIcon, PlusIcon } from '@phosphor-icons/react';
import { useId } from 'react';
import { buttonClassName } from '../../components/ui/button-styles';
import { useComparison } from './comparison-context';
import { COMPARE_MAX, itemName, type ComparisonItem } from './comparison-selection';

const FULL_TRAY_MESSAGE = `La comparación ya tiene ${String(COMPARE_MAX)} motos. Quita una para añadir otra.`;

const PRESSED_CLASSES =
  'aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent aria-pressed:hover:bg-accent aria-pressed:hover:brightness-110';
// aria-disabled instead of disabled: the button stays focusable, so keyboard and screen reader
// users can still reach it and hear why it does nothing
const BLOCKED_CLASSES = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

/**
 * Button alternative to dragging (WCAG 2.2 "Dragging movements"). A toggle button keeps the
 * same name and reports its state with aria-pressed, as the APG pattern recommends; only the
 * icon changes. The hidden part of the name tells the many "Comparar" buttons apart.
 */
export function CompareToggle({ item }: { item: ComparisonItem }) {
  const { isSelected, isFull, add, remove } = useComparison();
  const selected = isSelected(item.slug);
  const blocked = isFull && !selected;
  const hintId = useId();

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={blocked || undefined}
      aria-describedby={blocked ? hintId : undefined}
      title={blocked ? FULL_TRAY_MESSAGE : undefined}
      onClick={() => {
        if (selected) remove(item.slug);
        else if (!blocked) add(item);
      }}
      className={buttonClassName('ghost', `${PRESSED_CLASSES} ${BLOCKED_CLASSES}`, 'compact')}
    >
      {selected ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
      Comparar
      <span className="sr-only"> {itemName(item)}</span>
      {blocked && (
        <span id={hintId} hidden>
          {FULL_TRAY_MESSAGE}
        </span>
      )}
    </button>
  );
}
