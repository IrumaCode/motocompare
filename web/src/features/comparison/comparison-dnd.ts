import type {
  Announcements,
  KeyboardCoordinateGetter,
  ScreenReaderInstructions,
} from '@dnd-kit/core';
import { isComparisonItem, itemName } from './comparison-selection';

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

/**
 * Spanish live-region messages. Only free cards can be dragged (DragHandle disables the rest),
 * so a drop on the tray always adds the motorcycle.
 */
const describe = (data: unknown, message: (name: string) => string) =>
  isComparisonItem(data) ? message(itemName(data)) : undefined;

export const TRAY_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => describe(active.data.current, (name) => `Tomaste la ${name}.`),
  onDragOver: ({ active, over }) =>
    describe(active.data.current, (name) =>
      over?.id === TRAY_DROP_ID
        ? `La ${name} está sobre la bandeja de comparación.`
        : `La ${name} ya no está sobre la bandeja.`,
    ),
  onDragEnd: ({ active, over }) =>
    describe(active.data.current, (name) =>
      over?.id === TRAY_DROP_ID
        ? `Añadiste la ${name} a la comparación.`
        : `Soltaste la ${name} fuera de la bandeja.`,
    ),
  onDragCancel: ({ active }) =>
    describe(active.data.current, (name) => `Cancelaste el arrastre de la ${name}.`),
};
