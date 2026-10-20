import { describe, expect, it } from 'vitest';
import { fakeExchangeRateProvider, RATE } from '../test/fakes.js';
import { createPriceService } from './price-service.js';

describe('PriceService', () => {
  it('converts USD to whole pesos', async () => {
    const prices = createPriceService(fakeExchangeRateProvider({ ...RATE, copPerUsd: 3156.32 }));

    // 8199 × 3156.32 = 25 878 667.68 → rounded to the nearest peso
    expect(await prices.toCop(8199)).toBe(25_878_668);
  });

  it('returns null when the motorcycle has no price', async () => {
    const prices = createPriceService(fakeExchangeRateProvider());

    expect(await prices.toCop(null)).toBeNull();
  });

  it('returns null instead of failing when the rate source is down', async () => {
    const prices = createPriceService(fakeExchangeRateProvider(new Error('timeout')));

    expect(await prices.toCop(8199)).toBeNull();
    expect(await prices.getExchangeRate()).toBeNull();
  });
});
