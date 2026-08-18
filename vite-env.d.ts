/// <reference types="vite/client" />
/// <reference types="vitest" />

interface ImportMetaEnv {
  readonly VITE_API_AUDIENCE: string;
  readonly VITE_LOCAL_DOMAIN: string;
  readonly VITE_PORT: number;
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENTID: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_UI_FLAGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
