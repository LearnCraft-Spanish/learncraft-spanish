import * as Sentry from '@sentry/react'
// SentryRoutes.js
import React from 'react'
import { createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType } from 'react-router-dom'

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)

Sentry.init({
  dsn: 'https://e42f3e1acdc86e3e3119dbd586514255@o4507097747423232.ingest.us.sentry.io/4507097897500672',
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

export default SentryRoutes
