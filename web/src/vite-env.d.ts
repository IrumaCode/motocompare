/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GraphQL endpoint. Defaults to "/graphql" (proxied to the local API in development) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
