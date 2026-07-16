// SentryRoutes.js
import { config } from '@config';
import * as Sentry from '@sentry/react';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

Sentry.init({
  dsn: 'https://e42f3e1acdc86e3e3119dbd586514255@o4507097747423232.ingest.us.sentry.io/4507097897500672',
  environment: config.environment,
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
  // Stale cached clients after deploy request hashed chunks that no longer exist.
  // Handled by the vite:preloadError reload in index.tsx — not actionable noise.
  ignoreErrors: [
    /Failed to fetch dynamically imported module/,
    /Importing a module script failed/,
    /error loading dynamically imported module/,
    /'text\/html' is not a valid JavaScript MIME type/,
  ],
  denyUrls: [
    // Add URLs that shouldn't trigger Sentry
    /localhost/,
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export default SentryRoutes;
