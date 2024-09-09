// Providers.tsx
import type { ReactNode } from 'react'
import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ActiveStudentProvider } from './contexts/ActiveStudentContext'

interface ProvidersProps {
  children: ReactNode
}

function Providers({ children }: ProvidersProps) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENTID
  const audience = import.meta.env.VITE_API_AUDIENCE
  const redirect_uri = import.meta.env.VITE_LOCAL_DOMAIN

  const navigate = useNavigate()
  const queryClient = new QueryClient()

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
      <QueryClientProvider client={queryClient}>
        <ActiveStudentProvider>
          {children}
        </ActiveStudentProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Auth0Provider>
  )
}

export default Providers
