export interface AuthUser {
  email: string;
  roles: string[];
}

/**
 * Port for authentication token operations.
 * This defines the interface that infrastructure must implement.
 */
export interface AuthPort {
  /**
   * Get the current access token for authenticated requests
   */
  getAccessToken: (
    scopes: readonly string[] | null,
  ) => Promise<string | undefined>;

  /**
   * Login the user
   */
  login: () => void;

  /**
   * Logout the user
   */
  logout: () => void;

  /**
   * Ask the auth provider to email a password-reset link to this address.
   * Resolves once the provider accepts the request.
   */
  requestPasswordReset: (email: string) => Promise<void>;

  /**
   * Get the current user's information
   */
  authUser: AuthUser;

  /**
   * Boolean flags for the user's roles
   */
  isAdmin: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isLimited: boolean;

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Check if the user is loading
   */
  isLoading: boolean;
}
