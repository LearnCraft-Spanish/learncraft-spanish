// index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import * as Sentry from '@sentry/react'
import App from './App'
import Providers from './Providers'
import SentryRoutes from './functions/SentryRoutes'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Providers>
        <App SentryRoutes={SentryRoutes} />
      </Providers>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
