import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'

function LoginButton(): JSX.Element | false {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  function loginFunction() {
    function generateRandomString(length: number) {
      const charset
        = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz+/'
      let result = ''

      while (length > 0) {
        const bytes = new Uint8Array(16)
        const random = window.crypto.getRandomValues(bytes)

        random.forEach((c) => {
          if (length ? length === 0 : false) {
            return
          }
          if (c < charset.length) {
            result += charset[c]
            length--
          }
        })
      }
      return result
    }

    const randomString = generateRandomString(13)
    const currentLocation = window.location.pathname
    const expiresAt = Date.now() + 300000

    const jsonToStore = JSON.stringify({
      navigateToUrl: currentLocation,
      expiresAt,
    })
    localStorage.setItem(randomString, jsonToStore)

    loginWithRedirect(
      { appState: { targetUrl: currentLocation, state: randomString } },
    )
  }

  return (
    !isAuthenticated
    && !isLoading && <button type="button" id="login" onClick={loginFunction}>Log in/Register</button>
  )
}

export default LoginButton
