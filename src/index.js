import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <Auth0Provider
    domain="dev-34nyaerydb7nt4yw.us.auth0.com"
    clientId="8EjjTUWQkoHPL1DvOfH1xePnqkZ0s8bO"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://lcs-api.herokuapp.com/",
      scopes: "openid profile email"
    }}
  >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
