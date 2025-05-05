import { QueryClient } from '@tanstack/react-query';

/**
 * Default QueryClient configuration for tests.
 * Ensures consistent, isolated behavior between tests.
 */
const defaultTestClientOptions = {
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for deterministic tests
      gcTime: 0, // Disable caching for test isolation
      refetchOnWindowFocus: false, // Prevent unwanted refetches
    },
  },
};

/**
 * Singleton QueryClient instance for tests.
 * This is reset between tests, so it's safe to reuse.
 */
export const testQueryClient = new QueryClient(defaultTestClientOptions);

/**
 * Reset the test QueryClient between tests.
 * Call this in afterEach() to ensure test isolation.
 */
export function resetTestQueryClient() {
  testQueryClient.clear();
}
