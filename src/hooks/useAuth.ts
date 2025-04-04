// src/hooks/useAuthAdapter.ts (your Auth0 adapter)
import { useAuth0 } from '@auth0/auth0-react';
const audience = import.meta.env.VITE_API_AUDIENCE;

export default function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const getAccessToken = async () => {
    try {
      // Only attempt to get token if user is authenticated
      if (!isAuthenticated) {
        console.error('Cannot get access token: User is not authenticated');
        return undefined;
      }

      console.error('Attempting to get access token silently');
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience,
          scope:
            'openid profile email read:current-student update:current-student read:all-students update:all-students update:course-data',
        },
        cacheMode: 'off',
      });

      if (!accessToken) {
        console.error('Received empty access token from Auth0');
      } else {
        console.error('Successfully retrieved access token');
      }

      return accessToken as string | undefined;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return undefined;
    }
  };

  const login = () => {
    function generateRandomString(length: number) {
      const charset =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz+/';
      let result = '';

      while (length > 0) {
        const bytes = new Uint8Array(16);
        const random = window.crypto.getRandomValues(bytes);

        random.forEach((c) => {
          if (length ? length === 0 : false) {
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

    const randomString = generateRandomString(13);
    const currentLocation = window.location.pathname;
    const expiresAt = Date.now() + 300000;

    const jsonToStore = JSON.stringify({
      navigateToUrl: currentLocation,
      expiresAt,
    });
    localStorage.setItem(randomString, jsonToStore);

    loginWithRedirect({
      appState: { targetUrl: currentLocation, state: randomString },
    });
  };

  const logout = () =>
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
    });

  return {
    isAuthenticated,
    isLoading,
    getAccessToken,
    login,
    logout,
  };
}
