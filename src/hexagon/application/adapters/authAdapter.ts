import type { AuthPort } from '@application/ports/authPort';
import { useAuthInfrastructure } from '@infrastructure/auth/authInfrastructure';

/**
 * Adapter hook for authentication operations.
 * Connects the application layer to the Auth0 implementation.
 */
export function useAuthAdapter(): AuthPort {
  // Get Auth0 provider hook
  const auth = useAuthInfrastructure();

  const authUser = auth.authUser;

  const isAdmin = authUser?.roles.includes('Admin');
  const isCoach = authUser?.roles.includes('Coach');
  const isStudent = authUser?.roles.includes('Student');
  const isLimited = authUser?.roles.includes('Limited');

  return {
    getAccessToken: async (scopes: string[] | null) => {
      return auth.getAccessToken(scopes);
    },

    isAuthenticated: auth.isAuthenticated,

    isLoading: auth.isLoading,

    authUser,
    isAdmin,
    isCoach,
    isStudent,
    isLimited,

    login: auth.login,

    logout: auth.logout,
  };
}
