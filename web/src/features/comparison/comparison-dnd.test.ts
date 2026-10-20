import type { Active, ClientRect, Over, SensorContext } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';
import { TRAY_ANNOUNCEMENTS, TRAY_DROP_ID, trayKeyboardCoordinates } from './comparison-dnd';
import type { ComparisonItem } from './comparison-selection';

// Real dragging can't be simulated in jsdom (it has no layout: every rect is 0), so these tests
// call the drag-and-drop rules directly with hand-made rects.

const rect = (left: number, top: number, width: number, height: number): ClientRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const CARD = rect(100, 200, 40, 40);
const TRAY = rect(0, 800, 1000, 80);
const ITEM: ComparisonItem = { slug: 'yamaha-mt-07-2024', name: 'MT-07', brandName: 'Yamaha' };

/** The card being dragged, as dnd-kit describes it. */
function activeCard(data: Record<string, unknown> = { ...ITEM }): Active {
  return {
    id: 'card',
    data: { current: data },
    rect: { current: { initial: CARD, translated: null } },
  };
}

/**
 * Only the fields the coordinate getter reads (the full context has a dozen more, filled by
 * dnd-kit while dragging). `trayRect: null` stands for a tray that has not been measured yet.
 */
function context(trayRect: ClientRect | null = TRAY): SensorContext {
  const partial: Partial<SensorContext> = {
    collisionRect: CARD,
    droppableRects: new Map(trayRect ? [[TRAY_DROP_ID, trayRect]] : []),
    active: activeCard(),
  };
  return partial as SensorContext;
}

const press = (code: string) => new KeyboardEvent('keydown', { code, cancelable: true });

describe('trayKeyboardCoordinates', () => {
  it('jumps to the center of the tray with →', () => {
    const event = press('ArrowRight');

    const target = trayKeyboardCoordinates(event, {
      active: 'card',
      currentCoordinates: { x: CARD.left, y: CARD.top },
      context: context(),
    });

    // Tray center (500, 840) minus half the dragged card (20, 20)
    expect(target).toEqual({ x: 480, y: 820 });
    expect(event.defaultPrevented).toBe(true);
  });

  it('goes back to where the card started with ←', () => {
    const target = trayKeyboardCoordinates(press('ArrowLeft'), {
      active: 'card',
      currentCoordinates: { x: 480, y: 820 },
      context: context(),
    });

    expect(target).toEqual({ x: CARD.left, y: CARD.top });
  });

  it('ignores ↑ and ↓, which would scroll the page away from the sticky tray', () => {
    for (const code of ['ArrowUp', 'ArrowDown']) {
      const event = press(code);

      expect(
        trayKeyboardCoordinates(event, {
          active: 'card',
          currentCoordinates: { x: CARD.left, y: CARD.top },
          context: context(),
        }),
      ).toBeUndefined();
      expect(event.defaultPrevented).toBe(false);
    }
  });

  it('does nothing while the tray has not been measured yet', () => {
    expect(
      trayKeyboardCoordinates(press('ArrowRight'), {
        active: 'card',
        currentCoordinates: { x: CARD.left, y: CARD.top },
        context: context(null),
      }),
    ).toBeUndefined();
  });
});

describe('TRAY_ANNOUNCEMENTS', () => {
  const active = activeCard();
  const tray: Over = {
    id: TRAY_DROP_ID,
    rect: TRAY,
    disabled: false,
    data: { current: undefined },
  };

  it('tells screen reader users what happens, in Spanish', () => {
    expect(TRAY_ANNOUNCEMENTS.onDragStart({ active })).toBe('Tomaste la Yamaha MT-07.');
    expect(TRAY_ANNOUNCEMENTS.onDragOver({ active, over: tray })).toBe(
      'La Yamaha MT-07 está sobre la bandeja de comparación.',
    );
    expect(TRAY_ANNOUNCEMENTS.onDragEnd({ active, over: tray })).toBe(
      'Añadiste la Yamaha MT-07 a la comparación.',
    );
    expect(TRAY_ANNOUNCEMENTS.onDragEnd({ active, over: null })).toBe(
      'Soltaste la Yamaha MT-07 fuera de la bandeja.',
    );
  });

  it('stays silent for anything that is not a motorcycle', () => {
    expect(TRAY_ANNOUNCEMENTS.onDragStart({ active: activeCard({ foo: 1 }) })).toBeUndefined();
  });
});
