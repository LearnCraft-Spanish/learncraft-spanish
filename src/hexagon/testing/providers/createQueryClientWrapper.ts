import { TestQueryClientProvider } from './TestQueryClientProvider';

/**
 * Create a wrapper function for renderHook and render.
 *
 * @example
 * // With renderHook:
 * const { result } = renderHook(() => useYourHook(), {
 *   wrapper: createQueryClientWrapper()
 * });
 *
 * // With render:
 * render(<YourComponent />, { wrapper: createQueryClientWrapper() });
 */
export function createQueryClientWrapper() {
  // Return a function that will wrap components with the provider
  return TestQueryClientProvider;
}
