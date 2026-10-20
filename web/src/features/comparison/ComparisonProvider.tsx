import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ComparisonContext, type ComparisonContextValue } from './comparison-context';
import {
  addItem,
  COMPARE_MAX,
  parseStoredItems,
  removeItem,
  type ComparisonItem,
} from './comparison-selection';

const STORAGE_KEY = 'motocompare-comparison';

function readStoredItems(): readonly ComparisonItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? [] : parseStoredItems(JSON.parse(stored));
  } catch {
    return []; // storage blocked or invalid JSON: start with an empty tray
  }
}

function storeItems(items: readonly ComparisonItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Not persisting is acceptable: the tray still works during this visit
  }
}

/** Single owner of the tray. It survives navigation and reloads through localStorage. */
export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly ComparisonItem[]>(readStoredItems);

  useEffect(() => {
    storeItems(items);
  }, [items]);

  const value = useMemo<ComparisonContextValue>(
    () => ({
      items,
      isFull: items.length >= COMPARE_MAX,
      isSelected: (slug) => items.some((item) => item.slug === slug),
      add: (item) => {
        // Computed from the current render's items so the caller gets the result right away
        const next = addItem(items, item);
        if (next.result === 'added') setItems(next.items);
        return next.result;
      },
      remove: (slug) => {
        setItems((current) => removeItem(current, slug));
      },
      clear: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <ComparisonContext value={value}>{children}</ComparisonContext>;
}
