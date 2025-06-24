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
    getAccessToken: async (scopes: string[]) => {
      return auth.getAccessToken(scopes);
    },

    isAuthenticated: () => {
      return auth.isAuthenticated || false;
    },

    getUserInfo: async () => {
      // The actual useAuth hook doesn't expose user info directly
      // We could fetch it separately if needed
      return null;
    },
  };
}
