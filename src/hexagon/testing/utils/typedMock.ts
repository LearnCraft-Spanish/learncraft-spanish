import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

/**
 * Creates a strictly typed mock function.
 * Use this instead of vi.fn() for all mocks within the hexagonal architecture.
 *
 * This enforces explicit type definitions for all mock functions.
 *
 * @example
 * // ❌ Avoid: vi.fn().mockReturnValue(...)
 * // ✅ Use: createTypedMock<() => string>().mockReturnValue('result')
 *
 * // Function with parameters
 * const mockFetch = createTypedMock<(url: string) => Promise<Response>>();
 *
 * // Function without parameters
 * const mockInit = createTypedMock<() => void>();
 */
export function createTypedMock<T extends (...args: any[]) => any>() {
  return vi.fn<T>();
}

/**
 * Creates a typed mock object with all methods properly typed.
 *
 * @example
 * interface UserService {
 *   getUser: (id: string) => Promise<User>;
 *   updateUser: (id: string, data: UserData) => Promise<User>;
 * }
 *
 * const mockUserService = createTypedMockObject<UserService>({
 *   getUser: async (id) => ({ id, name: 'Test' }),
 *   updateUser: async (id, data) => ({ id, ...data })
 * });
 */
export function createTypedMockObject<
  T extends Record<string, (...args: any[]) => any>,
>(
  implementation?: Partial<{
    [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<T[K]>;
  }>,
): { [K in keyof T]: MockInstance<T[K]> } {
  const result: any = {};

  // Create a typed mock for each method
  for (const key in implementation || {}) {
    result[key] = vi.fn(implementation?.[key]);
  }

  return result as { [K in keyof T]: MockInstance<T[K]> };
}

/**
 * Helper type to extract the return type of a function that returns a hook result.
 * Useful for typing mock hook factory functions.
 */
export type HookResultType<T extends () => any> = ReturnType<T>;
