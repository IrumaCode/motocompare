import type {
  ExchangeRate,
  ExchangeRateProvider,
} from '../exchange-rate/exchange-rate-provider.js';

export interface PriceService {
  /** Current rate, or null when the source is unavailable */
  getExchangeRate(): Promise<ExchangeRate | null>;
  /** USD price converted to whole pesos; null when there is no price or no rate */
  toCop(priceUsd: number | null): Promise<number | null>;
}

export function createPriceService(provider: ExchangeRateProvider): PriceService {
  async function getExchangeRate(): Promise<ExchangeRate | null> {
    try {
      return await provider.getUsdToCop();
    } catch {
      // A missing rate must not break the query; the provider already logged the failure
      return null;
    }
  }

  return {
    getExchangeRate,

    async toCop(priceUsd) {
      if (priceUsd === null) {
        return null;
      }
      const rate = await getExchangeRate();
      return rate ? Math.floor(priceUsd * rate.copPerUsd) : null;
    },
  };
}
