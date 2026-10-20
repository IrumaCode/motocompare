import { describe, expect, it } from 'vitest';
import {
  addItem,
  parseStoredItems,
  removeItem,
  toComparisonItem,
  type ComparisonItem,
} from './comparison-selection';

const item = (slug: string): ComparisonItem => ({ slug, name: slug.toUpperCase(), brandName: 'X' });

describe('tray rules', () => {
  it('adds at the end', () => {
    expect(addItem([item('a')], item('b'))).toEqual([item('a'), item('b')]);
  });

  it('ignores a motorcycle that is already there', () => {
    const items = [item('a')];

    expect(addItem(items, item('a'))).toBe(items);
  });

  it('holds 4 motorcycles at most', () => {
    const full = ['a', 'b', 'c', 'd'].map(item);

    expect(addItem(full, item('e'))).toBe(full);
  });

  it('removes by slug', () => {
    expect(removeItem([item('a'), item('b')], 'a')).toEqual([item('b')]);
  });

  it('builds a tray item from any motorcycle with a brand', () => {
    expect(toComparisonItem({ slug: 's', name: 'MT-07', brand: { name: 'Yamaha' } })).toEqual({
      slug: 's',
      name: 'MT-07',
      brandName: 'Yamaha',
    });
  });
});

describe('parseStoredItems', () => {
  it('keeps only valid, distinct items, up to 4', () => {
    const stored: unknown = [
      item('a'),
      { slug: 'no-name' },
      'garbage',
      null,
      item('a'),
      item('b'),
      item('c'),
      item('d'),
      item('e'),
    ];

    expect(parseStoredItems(stored)).toEqual(['a', 'b', 'c', 'd'].map(item));
  });

  it('returns an empty tray for anything that is not a list', () => {
    expect(parseStoredItems({ slug: 'a' })).toEqual([]);
  });
});
