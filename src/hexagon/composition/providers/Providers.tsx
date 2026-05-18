// Providers.tsx
import type { ReactNode } from 'react';
import HexagonProviders from '@application/coordinators/providers/MainProvider'; // Hexagon Providers
import { Auth0Provider } from '@auth0/auth0-react';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ModalProvider } from '@composition/providers/ModalProvider';
import { config } from '@config';

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const domain = config.auth0Domain;
  const clientId = config.auth0ClientId;
  const audience = config.apiAudience;

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
        <ModalProvider>
          <HexagonProviders>{children}</HexagonProviders>
        </ModalProvider>
      </ContextualMenuProvider>
    </Auth0Provider>
  );
}

export default Providers;
