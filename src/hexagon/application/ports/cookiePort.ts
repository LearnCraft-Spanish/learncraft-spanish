/**
 * Port for cookie operations.
 * This defines the interface that infrastructure must implement.
 */
export interface CookiePort {
  /**
   * Gets a cookie value by name
   * @param name - The name of the cookie to retrieve
   * @returns The cookie value or null if not found
   */
  getCookie: (name: string) => string | null;

  /**
   * Sets a cookie with the specified name, value, and expiration
   * @param name - The name of the cookie
   * @param value - The value to store in the cookie
   * @param expirationDate - The date when the cookie should expire
   * @param path - The path scope for the cookie (defaults to '/')
   */
  setCookie: (
    name: string,
    value: string,
    expirationDate: Date,
    path?: string,
  ) => void;

  /**
   * Deletes a cookie by setting its expiration to the past
   * @param name - The name of the cookie to delete
   * @param path - The path scope for the cookie (defaults to '/')
   */
  deleteCookie: (name: string, path?: string) => void;
}
