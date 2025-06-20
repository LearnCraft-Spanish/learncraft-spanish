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
  getAccessToken: () => Promise<string | undefined>;

  /**
   * Login the user
   */
  login: () => void;

  /**
   * Logout the user
   */
  logout: () => void;

  /**
   * Get the current user's information
   */
  authUser: AuthUser;

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Check if the user is loading
   */
  isLoading: boolean;
}
