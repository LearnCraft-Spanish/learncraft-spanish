// index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import * as Sentry from '@sentry/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Providers from './Providers'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <BrowserRouter>
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
