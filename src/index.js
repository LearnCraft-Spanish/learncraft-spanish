import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="login.learncraftspanish.com"
        clientId="8EjjTUWQkoHPL1DvOfH1xePnqkZ0s8bO"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: "https://lcs-api.herokuapp.com/",
          scope: "openid profile email read:current-student update:current-student read:all-students update:all-students",
        }}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
