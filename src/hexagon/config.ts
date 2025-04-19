const viteConsts = import.meta.env;

export const config = {
  apiAudience: viteConsts.VITE_API_AUDIENCE,
  apiUrl: viteConsts.VITE_BACKEND_URL,
  auth0ClientId: viteConsts.VITE_AUTH0_CLIENTID,
  auth0Domain: viteConsts.VITE_AUTH0_DOMAIN,
  authToken: viteConsts.VITE_AUTH_TOKEN,
  backendDomain: viteConsts.VITE_BACKEND_DOMAIN,
  backendUrl: viteConsts.VITE_BACKEND_URL,
  environment: viteConsts.VITE_ENVIRONMENT,
  localDomain: viteConsts.VITE_LOCAL_DOMAIN,
  port: viteConsts.VITE_PORT,
};
