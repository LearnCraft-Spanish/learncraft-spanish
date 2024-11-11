// Providers.tsx
import type { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import useNavigatePreserveQuery from '../hooks/useNavigatePreserveQuery';
import { ContextualMenuProvider } from './ContextualMenuProvider';

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENTID;
  const audience = import.meta.env.VITE_API_AUDIENCE;

  const redirectUriWithQuery = `${window.location.origin}${location.search}`;

  const navigate = useNavigatePreserveQuery();

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUriWithQuery,
        audience,
        scope:
          'openid profile email read:current-student update:current-student read:all-students update:all-students',
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.targetUrl || '/', { replace: true });
      }}
    >
      <ContextualMenuProvider>{children}</ContextualMenuProvider>
    </Auth0Provider>
  );
}

export default Providers;
