import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

const DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

describe('loadConfig', () => {
  it('fails fast when DATABASE_URL is missing', () => {
    expect(() => loadConfig({})).toThrow('DATABASE_URL is not set');
  });

  it('defaults to port 4000 and any CORS origin', () => {
    expect(loadConfig({ DATABASE_URL })).toEqual({
      databaseUrl: DATABASE_URL,
      port: 4000,
      corsOrigins: [],
    });
  });

  it('rejects a port that is not a valid number', () => {
    expect(() => loadConfig({ DATABASE_URL, PORT: '99999' })).toThrow('PORT must be an integer');
  });

  it('reads a comma-separated list of CORS origins', () => {
    const config = loadConfig({
      DATABASE_URL,
      CORS_ORIGINS:
        ' https://motocompare.sneyderla.dev, https://motocompare.zsneyder.workers.dev ,',
    });

    expect(config.corsOrigins).toEqual([
      'https://motocompare.sneyderla.dev',
      'https://motocompare.zsneyder.workers.dev',
    ]);
  });
});
