import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <Auth0Provider
    domain="dev-34nyaerydb7nt4yw.us.auth0.com"
    clientId="8EjjTUWQkoHPL1DvOfH1xePnqkZ0s8bO"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: 'local-backend-test',
      scope: 'openid email profile read:users '
    }}
  >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
