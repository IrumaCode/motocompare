export interface ExchangeRate {
  readonly copPerUsd: number;
  /** Date (YYYY-MM-DD) from which the rate applies */
  readonly validFrom: string;
  readonly source: string;
}

/** Source of the USD to COP rate. Implementations may throw when the source is unavailable. */
export interface ExchangeRateProvider {
  getUsdToCop(): Promise<ExchangeRate>;
}
