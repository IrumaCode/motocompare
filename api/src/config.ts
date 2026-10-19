export interface Config {
  readonly databaseUrl: string;
  readonly port: number;
}

const DEFAULT_PORT = 4000;

function parsePort(value: string | undefined): number {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${value}"`);
  }
  return port;
}

/** Reads and validates configuration once at startup, so a bad value fails fast. */
export function loadConfig(env: Readonly<Record<string, string | undefined>>): Config {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set (copy .env.example to .env)');
  }
  return { databaseUrl, port: parsePort(env.PORT) };
}
