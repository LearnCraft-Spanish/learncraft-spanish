import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter,Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";
require('dotenv').config()

const root = ReactDOM.createRoot(document.getElementById('root'))
const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENTID
const audience = process.env.REACT_APP_API_AUDIENCE
const redirect_uri = process.env.REACT_APP_LOCAL_DOMAIN

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
        }}
      >
       <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
