const viteConsts = import.meta.env;

export const config = {
  apiUrl: viteConsts.VITE_BACKEND_URL,
  apiAudience: viteConsts.VITE_API_AUDIENCE,
  localDomain: viteConsts.VITE_LOCAL_DOMAIN,
  port: viteConsts.VITE_PORT,
  auth0Domain: viteConsts.VITE_AUTH0_DOMAIN,
  auth0ClientId: viteConsts.VITE_AUTH0_CLIENTID,
  environment: viteConsts.VITE_ENVIRONMENT,
  authToken: viteConsts.VITE_AUTH_TOKEN,
  backendUrl: viteConsts.VITE_BACKEND_URL,
};
