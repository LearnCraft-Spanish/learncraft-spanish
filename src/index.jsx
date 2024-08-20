import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
} from 'react-router-dom'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'

import App from './App.jsx'
import SentryRoutes from './functions/SentryRoutes'

const root = ReactDOM.createRoot(document.getElementById('root'))
const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENTID
const audience = import.meta.env.VITE_API_AUDIENCE
const redirect_uri = import.meta.env.VITE_LOCAL_DOMAIN

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: `${redirect_uri}callback`,
          audience,
          scope:
            'openid profile email read:current-student update:current-student read:all-students update:all-students',
        }}
      >
        <App SentryRoutes={SentryRoutes} />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
