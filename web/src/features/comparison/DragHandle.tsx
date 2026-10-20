import { useDraggable } from '@dnd-kit/core';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import { useComparison } from './comparison-context';
import { itemName, type ComparisonItem } from './comparison-selection';

/**
 * Only this handle starts a drag (not the whole card), so scrolling the list with a finger
 * keeps working: touch-none applies to the handle alone.
 */
export function DragHandle({ item }: { item: ComparisonItem }) {
  const { isSelected, isFull } = useComparison();
  const disabled = isSelected(item.slug) || isFull;
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `compare-${item.slug}`,
    data: item,
    disabled,
    attributes: { roleDescription: 'arrastrable' },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-label={`Arrastrar ${itemName(item)} a la comparación`}
      disabled={disabled}
      className={`inline-flex size-11 cursor-grab touch-none items-center justify-center rounded-lg border border-line text-ink-muted transition duration-200 hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${isDragging ? 'opacity-40' : ''}`}
    >
      <DotsSixVerticalIcon size={18} />
    </button>
  );
}
