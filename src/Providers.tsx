// Providers.tsx
import type { ReactNode } from 'react'
import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

interface ProvidersProps {
  children: ReactNode
}

function Providers({ children }: ProvidersProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENTID
  const audience = import.meta.env.VITE_API_AUDIENCE
  const redirect_uri = import.meta.env.VITE_LOCAL_DOMAIN

  const navigate = useNavigate()

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${redirect_uri}callback`,
        audience,
        scope:
          'openid profile email read:current-student update:current-student read:all-students update:all-students',
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.targetUrl || '/', { replace: true })
      }}
    >
      {children}
    </Auth0Provider>
  )
}

export default Providers
