import { describe, expect, it, vi } from 'vitest';
import { withCache } from './cached-provider.js';
import type { ExchangeRate, ExchangeRateProvider } from './exchange-rate-provider.js';

const TTL_MS = 1_000;
const RETRY_DELAY_MS = 100;

const rate = (copPerUsd: number): ExchangeRate => ({
  copPerUsd,
  validFrom: '2026-10-20',
  source: 'test',
});

interface PendingCall {
  promise: Promise<ExchangeRate>;
  resolve: (value: ExchangeRate) => void;
  reject: (reason: Error) => void;
}

// Same as Promise.withResolvers (ES2024), which the ES2023 lib of this project does not include
function pendingCall(): PendingCall {
  let resolve: PendingCall['resolve'] = () => undefined;
  let reject: PendingCall['reject'] = () => undefined;
  const promise = new Promise<ExchangeRate>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/**
 * A source answered by hand (each call waits until the test resolves or rejects it), plus a
 * clock the test moves. Together they make every timing case deterministic.
 */
function setup() {
  const pending: PendingCall[] = [];
  const source: ExchangeRateProvider = {
    getUsdToCop: () => {
      const call = pendingCall();
      pending.push(call);
      return call.promise;
    },
  };
  let time = 0;
  const logger = { warn: vi.fn() };
  const cached = withCache(source, {
    ttlMs: TTL_MS,
    retryDelayMs: RETRY_DELAY_MS,
    logger,
    now: () => time,
  });
  return {
    cached,
    /** Called when a refresh fails: the moment the cache has scheduled its retry. */
    warn: logger.warn,
    calls: () => pending.length,
    /** Settles the latest request to the source. */
    answer: (value: ExchangeRate | Error) => {
      const request = pending.at(-1);
      if (value instanceof Error) request?.reject(value);
      else request?.resolve(value);
    },
    advance: (ms: number) => {
      time += ms;
    },
  };
}

describe('withCache', () => {
  it('shares the first request among concurrent callers', async () => {
    const { cached, calls, answer } = setup();

    const first = cached.getUsdToCop();
    const second = cached.getUsdToCop();
    answer(rate(4000));

    expect(await first).toEqual(rate(4000));
    expect(await second).toEqual(rate(4000));
    expect(calls()).toBe(1);
  });

  it('reuses the rate until the TTL expires', async () => {
    const { cached, calls, answer, advance } = setup();
    const first = cached.getUsdToCop();
    answer(rate(4000));
    await first;

    advance(TTL_MS - 1);

    expect(await cached.getUsdToCop()).toEqual(rate(4000));
    expect(calls()).toBe(1);
  });

  it('serves the old rate at once after the TTL while it refreshes in the background', async () => {
    const { cached, calls, answer, advance } = setup();
    const first = cached.getUsdToCop();
    answer(rate(4000));
    await first;
    advance(TTL_MS);

    // Stale-while-revalidate: the caller does not wait for the new request
    expect(await cached.getUsdToCop()).toEqual(rate(4000));
    expect(calls()).toBe(2);

    answer(rate(4100));
    await vi.waitFor(async () => {
      expect(await cached.getUsdToCop()).toEqual(rate(4100));
    });
  });

  it('keeps the old rate when a refresh fails and waits before retrying', async () => {
    const { cached, calls, answer, advance, warn } = setup();
    const first = cached.getUsdToCop();
    answer(rate(4000));
    await first;
    advance(TTL_MS);
    await cached.getUsdToCop();
    answer(new Error('source down'));
    // The background refresh settles asynchronously: wait until the failure was handled
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledOnce();
    });

    advance(RETRY_DELAY_MS - 1);
    expect(await cached.getUsdToCop()).toEqual(rate(4000));
    expect(calls()).toBe(2);

    advance(1);
    await cached.getUsdToCop();
    expect(calls()).toBe(3);
  });

  it('fails when the first request fails, and does not hammer the source', async () => {
    const { cached, calls, answer } = setup();

    const first = cached.getUsdToCop();
    answer(new Error('source down'));

    await expect(first).rejects.toThrow('source down');
    await expect(cached.getUsdToCop()).rejects.toThrow('waiting to retry');
    expect(calls()).toBe(1);
  });
});
