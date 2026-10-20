import { describe, expect, it } from 'vitest';
import { slugsFromSearchParams, toCompareHref } from './compare-url';

describe('compare URL', () => {
  it('writes and reads the slugs in order', () => {
    const href = toCompareHref(['b', 'a']);

    expect(href).toBe('/comparar?moto=b&moto=a');
    expect(slugsFromSearchParams(new URLSearchParams(href.split('?')[1]))).toEqual(['b', 'a']);
  });

  it('drops empty and repeated slugs and keeps 4 at most', () => {
    const params = new URLSearchParams('moto=a&moto=&moto=a&moto=b&moto=c&moto=d&moto=e');

    expect(slugsFromSearchParams(params)).toEqual(['a', 'b', 'c', 'd']);
  });
});
