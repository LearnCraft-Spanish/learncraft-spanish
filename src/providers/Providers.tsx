// Providers.tsx
import type { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextualMenuProvider } from './ContextualMenuProvider';
import { ModalProvider } from './ModalProvider';

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENTID;
  const audience = import.meta.env.VITE_API_AUDIENCE;

  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope:
          'openid profile email read:current-student update:current-student read:all-students update:all-students update:course-data',
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.targetUrl || '/', { replace: true });
      }}
    >
      <ContextualMenuProvider>
        <ModalProvider>{children}</ModalProvider>
      </ContextualMenuProvider>
    </Auth0Provider>
  );
}

export default Providers;
