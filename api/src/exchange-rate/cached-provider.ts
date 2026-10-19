import type { ExchangeRate, ExchangeRateProvider } from './exchange-rate-provider.js';

export interface CacheOptions {
  /** How long a fetched rate is reused before refreshing it */
  readonly ttlMs: number;
  /** How long to wait before retrying after a failed refresh */
  readonly retryDelayMs: number;
  readonly logger?: Pick<Console, 'warn'>;
  readonly now?: () => number;
}

/**
 * Decorator that adds an in-memory cache to any provider:
 * - concurrent callers share a single in-flight request;
 * - when a refresh fails, the last known rate keeps being served (stale is better than nothing)
 *   and the source is not called again until `retryDelayMs` has passed.
 */
export function withCache(
  provider: ExchangeRateProvider,
  { ttlMs, retryDelayMs, logger = console, now = Date.now }: CacheOptions,
): ExchangeRateProvider {
  let cached: ExchangeRate | undefined;
  let nextRefreshAt = 0;
  let inFlight: Promise<ExchangeRate> | undefined;

  async function refresh(): Promise<ExchangeRate> {
    try {
      cached = await provider.getUsdToCop();
      nextRefreshAt = now() + ttlMs;
      return cached;
    } catch (error) {
      nextRefreshAt = now() + retryDelayMs;
      logger.warn('Exchange rate refresh failed', error);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  return {
    getUsdToCop() {
      if (now() < nextRefreshAt) {
        return cached
          ? Promise.resolve(cached)
          : Promise.reject(new Error('Exchange rate unavailable; waiting to retry'));
      }
      inFlight ??= refresh().finally(() => {
        inFlight = undefined;
      });
      return inFlight;
    },
  };
}
