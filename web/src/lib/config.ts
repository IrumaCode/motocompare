const configuredApiUrl = import.meta.env.VITE_API_URL;

// An empty value (e.g. `VITE_API_URL=` left in .env) counts as not set
export const apiUrl =
  configuredApiUrl === undefined || configuredApiUrl === '' ? '/graphql' : configuredApiUrl;
