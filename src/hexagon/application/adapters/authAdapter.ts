import type { AuthPort } from '../ports/authPort';
import useAuth from '../../../hooks/useAuth';

/**
 * Adapter hook for authentication operations.
 * Connects the application layer to the Auth0 implementation.
 */
export function useAuthAdapter(): AuthPort {
  // Get Auth0 provider hook
  const auth = useAuth();

  return {
    getAccessToken: async () => {
      return auth.getAccessToken();
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
