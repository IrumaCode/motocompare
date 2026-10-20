import type {
  Announcements,
  KeyboardCoordinateGetter,
  ScreenReaderInstructions,
} from '@dnd-kit/core';
import { FULL_TRAY_MESSAGE, isComparisonItem, type ComparisonItem } from './comparison-selection';

// Drag and drop rules for the comparison tray. A .ts file (no components) so the tray, the
// drag handle and the DndContext share them without breaking react-refresh.

export const TRAY_DROP_ID = 'comparison-tray';

/**
 * Keyboard dragging with a single destination: → jumps straight to the tray, ← back to the
 * card. ↑/↓ are ignored on purpose: the KeyboardSensor scrolls the page on vertical moves near
 * the viewport edge, and the tray is sticky, so it would never be reached that way.
 */
export const trayKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const dragged = context.collisionRect;
  if (!dragged) return undefined;

  if (event.code === 'ArrowRight') {
    const tray = context.droppableRects.get(TRAY_DROP_ID);
    if (!tray) return undefined;
    event.preventDefault();
    return {
      x: tray.left + tray.width / 2 - dragged.width / 2,
      y: tray.top + tray.height / 2 - dragged.height / 2,
    };
  }
  if (event.code === 'ArrowLeft') {
    const start = context.active?.rect.current.initial;
    if (!start) return undefined;
    event.preventDefault();
    return { x: start.left, y: start.top };
  }
  return undefined;
};

export const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'Para arrastrar, pulsa espacio o Enter. Con la flecha derecha llevas la moto a la bandeja de ' +
    'comparación y con la izquierda la devuelves. Pulsa espacio o Enter para soltarla, o ' +
    'Escape para cancelar.',
};

const nameOf = (item: ComparisonItem) => `${item.brandName} ${item.name}`;

interface TrayState {
  isSelected: (slug: string) => boolean;
  isFull: boolean;
}

/**
 * Spanish live-region messages. They are built with the tray state of the current render, which
 * is still the state before the drop when onDragEnd fires.
 */
export function createTrayAnnouncements({ isSelected, isFull }: TrayState): Announcements {
  const describe = (data: unknown, message: (item: ComparisonItem) => string) =>
    isComparisonItem(data) ? message(data) : undefined;

  return {
    onDragStart: ({ active }) =>
      describe(active.data.current, (item) => `Tomaste la ${nameOf(item)}.`),
    onDragOver: ({ active, over }) =>
      describe(active.data.current, (item) =>
        over?.id === TRAY_DROP_ID
          ? `La ${nameOf(item)} está sobre la bandeja de comparación.`
          : `La ${nameOf(item)} ya no está sobre la bandeja.`,
      ),
    onDragEnd: ({ active, over }) =>
      describe(active.data.current, (item) => {
        if (over?.id !== TRAY_DROP_ID) return `Soltaste la ${nameOf(item)} fuera de la bandeja.`;
        if (isSelected(item.slug)) return `La ${nameOf(item)} ya estaba en la comparación.`;
        if (isFull) return FULL_TRAY_MESSAGE;
        return `Añadiste la ${nameOf(item)} a la comparación.`;
      }),
    onDragCancel: ({ active }) =>
      describe(active.data.current, (item) => `Cancelaste el arrastre de la ${nameOf(item)}.`),
  };
}
