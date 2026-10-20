import { describe, expect, it } from 'vitest';
import { createTrmProvider } from './trm-provider.js';

/** A fetch that never touches the network: it always answers with this body and status. */
function fetchReturning(body: unknown, status = 200): typeof fetch {
  return () => Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe('createTrmProvider', () => {
  it('reads the latest rate from the datos.gov.co response', async () => {
    const trm = createTrmProvider(
      fetchReturning([{ valor: '3174.67', vigenciadesde: '2026-10-17T00:00:00.000' }]),
    );

    expect(await trm.getUsdToCop()).toEqual({
      copPerUsd: 3174.67,
      validFrom: '2026-10-17',
      source: 'TRM (datos.gov.co)',
    });
  });

  it('fails on an HTTP error', async () => {
    const trm = createTrmProvider(fetchReturning({ message: 'oops' }, 503));

    await expect(trm.getUsdToCop()).rejects.toThrow('HTTP 503');
  });

  it('fails when the response has no rows', async () => {
    const trm = createTrmProvider(fetchReturning([]));

    await expect(trm.getUsdToCop()).rejects.toThrow('no rows');
  });

  it.each([['abc'], ['0'], ['-1'], [3174.67]])('rejects the invalid valor %j', async (valor) => {
    const trm = createTrmProvider(
      fetchReturning([{ valor, vigenciadesde: '2026-10-17T00:00:00.000' }]),
    );

    await expect(trm.getUsdToCop()).rejects.toThrow('invalid "valor"');
  });
});
