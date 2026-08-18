const viteConsts = import.meta.env;

function parseUiFlags(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((flag) => flag.trim())
    .filter((flag) => flag.length > 0);
}

interface Config {
  apiAudience: string;
  auth0ClientId: string;
  auth0Domain: string;
  backendDomain: string;
  environment: string;
  localDomain: string;
  uiFlags: string[];
}

export const config: Config = {
  apiAudience: viteConsts.VITE_API_AUDIENCE,
  auth0ClientId: viteConsts.VITE_AUTH0_CLIENTID,
  auth0Domain: viteConsts.VITE_AUTH0_DOMAIN,
  backendDomain: viteConsts.VITE_BACKEND_DOMAIN,
  environment: viteConsts.VITE_ENVIRONMENT,
  localDomain: viteConsts.VITE_LOCAL_DOMAIN,
  uiFlags: parseUiFlags(viteConsts.VITE_UI_FLAGS),
};
