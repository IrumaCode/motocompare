import { createContext, useContext } from 'react';
import type { ComparisonItem } from './comparison-selection';

export interface ComparisonContextValue {
  items: readonly ComparisonItem[];
  isFull: boolean;
  isSelected: (slug: string) => boolean;
  /** No effect when the motorcycle is already there or the tray is full. */
  add: (item: ComparisonItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const ComparisonContext = createContext<ComparisonContextValue | null>(null);

/** Motorcycles waiting in the comparison tray (cards, tray, drag and drop). */
export function useComparison(): ComparisonContextValue {
  const value = useContext(ComparisonContext);
  if (!value) {
    throw new Error('useComparison must be used inside <ComparisonProvider>');
  }
  return value;
}
