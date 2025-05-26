/**
 * Utilities for working with TanStack Query.
 * These help maintain consistent patterns across query hooks.
 */

/**
 * Normalizes a TanStack Query error to ensure it's always an Error instance.
 * This provides a consistent error interface for consumers.
 *
 * @param error The unknown error from TanStack Query
 * @returns A proper Error object or null
 */
export function normalizeQueryError(error: unknown): Error | null {
  if (!error) return null;

  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Common query configuration options used across the application.
 */
export const queryDefaults = {
  /**
   * Configuration for rarely changing reference data.
   * Uses infinite stale time and cache time.
   */
  referenceData: {
    staleTime: Infinity,
    gcTime: Infinity,
  },

  /**
   * Configuration for standard entity data.
   * Uses reasonable defaults for typical entity data.
   */
  entityData: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
};
