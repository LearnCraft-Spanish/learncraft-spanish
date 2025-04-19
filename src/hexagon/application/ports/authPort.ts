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
   * Check if the user is authenticated
   */
  isAuthenticated: () => boolean;

  /**
   * Get the current user's information
   */
  getUserInfo: () => Promise<unknown | null>;
}
