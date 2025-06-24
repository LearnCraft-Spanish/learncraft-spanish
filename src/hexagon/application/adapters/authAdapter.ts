import type { AuthPort } from '@application/ports/authPort';
import { useAuthInfrastructure } from '@infrastructure/auth/authInfrastructure';

/**
 * Adapter hook for authentication operations.
 * Connects the application layer to the Auth0 implementation.
 */
export function useAuthAdapter(): AuthPort {
  // Get Auth0 provider hook
  const auth = useAuthInfrastructure();

  return {
    getAccessToken: async (scopes: string[] | null) => {
      return auth.getAccessToken(scopes);
    },

    isAuthenticated: auth.isAuthenticated,

    isLoading: auth.isLoading,

    authUser: auth.authUser,

    login: auth.login,

    logout: auth.logout,
  };
}
