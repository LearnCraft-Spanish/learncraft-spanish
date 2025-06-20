import type { AuthPort } from '@application/ports/authPort';
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';

export function useAuthInfrastructure(): AuthPort {
  const audience = import.meta.env.VITE_API_AUDIENCE;
  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const authUser = useMemo(() => {
    return {
      email: user ? user[`${audience}email`] : undefined,
      roles: user ? user[`${audience}roles`] : [],
    };
  }, [user, audience]);

  return {
    getAccessToken: async () => {
      try {
        // Only attempt to get token if user is authenticated
        if (!isAuthenticated) {
          return undefined;
        }

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience,
            scope:
              'openid profile email read:current-student update:current-student read:all-students update:all-students update:course-data',
          },
          cacheMode: 'off',
        });

        return accessToken as string | undefined;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },

    login: () => {
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
    },

    logout: () =>
      auth0Logout({
        logoutParams: { returnTo: window.location.origin },
      }),

    isAuthenticated,
    isLoading,
    authUser,
  };
}
