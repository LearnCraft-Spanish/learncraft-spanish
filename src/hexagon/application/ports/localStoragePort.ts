/**
 * Port for localStorage operations.
 * This defines the interface that infrastructure must implement.
 */
export interface LocalStoragePort {
  /**
   * Get a value from localStorage
   * @param key - The key to get the value from
   * @returns The value or null if not found
   */
  getItem: <T>(key: string) => T | null;
  setItem: <T>(key: string, value: T) => void;
  removeItem: (key: string) => void;
}
