import type { CookiePort } from '../application/ports/cookiePort';

/**
 * Creates a cookie infrastructure implementation that works with browser cookies
 */
export function createCookieInfrastructure(): CookiePort {
  /**
   * Gets a cookie value by name
   */
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  /**
   * Sets a cookie with the specified name, value, and expiration
   */
  const setCookie = (
    name: string,
    value: string,
    expirationDate: Date,
    path: string = '/',
  ): void => {
    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=${path}`;
  };

  /**
   * Deletes a cookie by setting its expiration to the past
   */
  const deleteCookie = (name: string, path: string = '/'): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  };

  return {
    getCookie,
    setCookie,
    deleteCookie,
  };
}
