import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter,useLocation, useNavigationType, createRoutesFromChildren, matchRoutes, Routes} from "react-router-dom";
import './index.css';
import * as Sentry from "@sentry/react";
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";
require('dotenv').config()

Sentry.init({
  dsn: "https://e42f3e1acdc86e3e3119dbd586514255@o4507097747423232.ingest.us.sentry.io/4507097897500672",
  environment: process.env.REACT_APP_ENVIRONMENT,
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
});

const root = ReactDOM.createRoot(document.getElementById('root'))
const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENTID
const audience = process.env.REACT_APP_API_AUDIENCE
const redirect_uri = process.env.REACT_APP_LOCAL_DOMAIN
const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: `${redirect_uri}callback`,
          audience: audience,
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
        }}>
       <App SentryRoutes = {SentryRoutes} />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
