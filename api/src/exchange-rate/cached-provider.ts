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
 * - only the very first call waits for the source; concurrent callers share that request;
 * - after the TTL, the last known rate is served immediately while a refresh runs in the
 *   background (it never rejects, because a cached rate exists to fall back on);
 * - after a failed refresh, the source is not called again until `retryDelayMs` has passed.
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
      if (now() >= nextRefreshAt) {
        inFlight ??= refresh().finally(() => {
          inFlight = undefined;
        });
      }
      // Stale-while-revalidate: once a rate exists, callers never wait for the refresh
      if (cached) {
        return Promise.resolve(cached);
      }
      return inFlight ?? Promise.reject(new Error('Exchange rate unavailable; waiting to retry'));
    },
  };
}
