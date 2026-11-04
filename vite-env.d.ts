/// <reference types="vite/client" />
/// <reference types="vitest" />

// Keep in sync with PUBLIC_ENV_KEYS in vite-plugins/env-guard.js.
interface ImportMetaEnv {
  readonly VITE_API_AUDIENCE: string;
  readonly VITE_AUTH0_CLIENTID: string;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_BACKEND_DOMAIN: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_PORT: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
