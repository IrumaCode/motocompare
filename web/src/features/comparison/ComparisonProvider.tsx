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

function parseStored(stored: string | null): readonly ComparisonItem[] {
  try {
    return stored === null ? [] : parseStoredItems(JSON.parse(stored));
  } catch {
    return []; // invalid JSON: start with an empty tray
  }
}

function readStoredItems(): readonly ComparisonItem[] {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return []; // storage blocked (e.g. private mode)
  }
}

function storeItems(items: readonly ComparisonItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Not persisting is acceptable: the tray still works during this visit
  }
}

/**
 * Single owner of the tray. It survives navigation and reloads through localStorage, and other
 * open tabs follow the changes (like the theme), so one tab never overwrites another's tray.
 */
export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly ComparisonItem[]>(readStoredItems);

  useEffect(() => {
    storeItems(items);
  }, [items]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(parseStored(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = useMemo<ComparisonContextValue>(
    () => ({
      items,
      isFull: items.length >= COMPARE_MAX,
      isSelected: (slug) => items.some((item) => item.slug === slug),
      add: (item) => {
        setItems((current) => addItem(current, item));
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
