import type { ExchangeRate, ExchangeRateProvider } from './exchange-rate-provider.js';

// Official Colombian TRM (Tasa Representativa del Mercado) published on datos.gov.co.
// Free, no API key; one value per business day.
const TRM_URL =
  'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1';
const SOURCE = 'TRM (datos.gov.co)';
const REQUEST_TIMEOUT_MS = 5_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Parses the Socrata response: `[{ "valor": "3174.67", "vigenciadesde": "2026-10-17T00:00:00.000" }]` */
function parseTrm(body: unknown): ExchangeRate {
  const latest: unknown = Array.isArray(body) ? body[0] : undefined;
  if (!isRecord(latest)) {
    throw new Error('TRM response has no rows');
  }

  const { valor, vigenciadesde } = latest;
  const copPerUsd = Number(valor);
  if (typeof valor !== 'string' || !Number.isFinite(copPerUsd) || copPerUsd <= 0) {
    throw new Error(`TRM response has an invalid "valor": ${JSON.stringify(valor)}`);
  }
  if (typeof vigenciadesde !== 'string') {
    throw new Error('TRM response has no "vigenciadesde"');
  }

  return { copPerUsd, validFrom: vigenciadesde.slice(0, 10), source: SOURCE };
}

export function createTrmProvider(fetchFn: typeof fetch = fetch): ExchangeRateProvider {
  return {
    async getUsdToCop() {
      const response = await fetchFn(TRM_URL, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`TRM request failed with HTTP ${String(response.status)}`);
      }
      return parseTrm(await response.json());
    },
  };
}
