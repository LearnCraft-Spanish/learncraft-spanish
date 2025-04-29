const viteConsts = import.meta.env;

export const config = {
  apiAudience: viteConsts.VITE_API_AUDIENCE,
  auth0ClientId: viteConsts.VITE_AUTH0_CLIENTID,
  auth0Domain: viteConsts.VITE_AUTH0_DOMAIN,
  backendDomain: viteConsts.VITE_BACKEND_DOMAIN,
  environment: viteConsts.VITE_ENVIRONMENT,
  localDomain: viteConsts.VITE_LOCAL_DOMAIN,
};
