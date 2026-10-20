import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMemo, useState, type ReactNode } from 'react';
import { MotoIllustration } from '../../components/MotoIllustration';
import { useComparison } from './comparison-context';
import {
  createTrayAnnouncements,
  SCREEN_READER_INSTRUCTIONS,
  TRAY_DROP_ID,
  trayKeyboardCoordinates,
} from './comparison-dnd';
import { isComparisonItem, type ComparisonItem } from './comparison-selection';

// The tray is sticky, so it does not move when the page scrolls: auto-scrolling while dragging
// would shift the cards but not the tray, and dnd-kit would miscalculate the drop.
const AUTO_SCROLL = false;
// Re-measure the tray while dragging: it can appear right when a drag starts (empty tray)
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

/** Compact preview that follows the pointer (lighter than cloning the whole card). */
function DragPreview({ item }: { item: ComparisonItem }) {
  return (
    <div className="flex w-max cursor-grabbing items-center gap-2 rounded-full border border-accent bg-surface px-3 py-2 text-sm shadow-lg">
      <MotoIllustration variant="mark" className="h-5 w-8" />
      <span className="text-ink-muted">{item.brandName}</span>
      <span className="font-semibold">{item.name}</span>
    </div>
  );
}

/** Lets any page drag motorcycle cards into the comparison tray. */
export function ComparisonDnd({ children }: { children: ReactNode }) {
  const { add, isSelected, isFull } = useComparison();
  const [dragged, setDragged] = useState<ComparisonItem | null>(null);

  const sensors = useSensors(
    // A few pixels of movement before dragging starts, so a tap on the handle is not a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: trayKeyboardCoordinates }),
  );
  const accessibility = useMemo(
    () => ({
      announcements: createTrayAnnouncements({ isSelected, isFull }),
      screenReaderInstructions: SCREEN_READER_INSTRUCTIONS,
    }),
    [isSelected, isFull],
  );

  return (
    <DndContext
      sensors={sensors}
      accessibility={accessibility}
      autoScroll={AUTO_SCROLL}
      measuring={MEASURING}
      onDragStart={({ active }) => {
        setDragged(isComparisonItem(active.data.current) ? active.data.current : null);
      }}
      onDragEnd={({ active, over }) => {
        setDragged(null);
        if (over?.id === TRAY_DROP_ID && isComparisonItem(active.data.current)) {
          add(active.data.current);
        }
      }}
      onDragCancel={() => {
        setDragged(null);
      }}
    >
      {children}
      {/* No drop animation: the preview simply disappears into the tray */}
      <DragOverlay dropAnimation={null}>{dragged && <DragPreview item={dragged} />}</DragOverlay>
    </DndContext>
  );
}
