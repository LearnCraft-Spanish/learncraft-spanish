import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { isAuthenticated, isLoading, loginWithRedirect} = useAuth0();
  const thisDomain = process.env.REACT_APP_LOCAL_DOMAIN;

  function loginFunction() {
    function generateRandomString(length) {
      const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz+/'
      let result = ''
  
      while (length > 0) {
          const bytes = new Uint8Array(16);
          const random = window.crypto.getRandomValues(bytes);
  
          random.forEach(function(c) {
              if (length == 0) {
                  return;
              }
              if (c < charset.length) {
                  result += charset[c];
                  length--;
              }
          });
      }
      return result;
  }

    const randomString = generateRandomString(13)
    const currentLocation = window.location.pathname
    const expiresAt = Date.now() + 300000
    console.log(`Expires at: ${expiresAt}`)

    const jsonToStore = JSON.stringify({navigateToUrl: currentLocation, expiresAt: expiresAt})
    localStorage.setItem(randomString, jsonToStore)

    loginWithRedirect({
      appState: {returnTo: `${thisDomain}callback?...&state=${randomString}`,
      }
    })
  }

  return (!isAuthenticated && !isLoading && (
    <button onClick={loginFunction}>Log in/Register</button>
  ))
};

export default LoginButton;