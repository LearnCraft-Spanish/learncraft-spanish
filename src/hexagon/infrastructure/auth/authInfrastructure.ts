import type { AuthPort } from '@application/ports/authPort';
import { useAuth0 } from '@auth0/auth0-react';
import { config } from '@config';
import { useMemo } from 'react';
export function useAuthInfrastructure(): AuthPort {
  const audience = config.apiAudience;
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

  const isAdmin = useMemo(() => {
    return authUser?.roles.includes('Admin');
  }, [authUser]);

  const isCoach = useMemo(() => {
    return authUser?.roles.includes('Coach');
  }, [authUser]);

  const isStudent = useMemo(() => {
    return authUser?.roles.includes('Student');
  }, [authUser]);

  const isLimited = useMemo(() => {
    return authUser?.roles.includes('Limited');
  }, [authUser]);

  return {
    getAccessToken: async (scopes: readonly string[] | null) => {
      try {
        if (!isAuthenticated) {
          return undefined;
        }

        const allScopes = [
          'openid profile email read:current-student update:current-student read:all-students update:all-students update:course-data',
        ];

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience,
            scope: scopes ? scopes.join(' ') : allScopes.join(' '),
          },
          // cacheMode: 'off' is causing issues with the token not being refreshed in local development
          // cacheMode: 'off',
        });

        return accessToken as string | undefined;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    },

    login: () => {
      // Auth0 persists appState through the redirect; Providers.onRedirectCallback
      // navigates to targetUrl. Do not use localStorage — it throws SecurityError
      // when storage is blocked (e.g. Safari private browsing) and is unused.
      loginWithRedirect({
        appState: { targetUrl: window.location.pathname },
      });
    },

    logout: () =>
      auth0Logout({
        logoutParams: { returnTo: window.location.origin },
      }),

    isAuthenticated,
    isLoading,

    authUser,

    isAdmin,
    isCoach,
    isStudent,
    isLimited,
  };
}
