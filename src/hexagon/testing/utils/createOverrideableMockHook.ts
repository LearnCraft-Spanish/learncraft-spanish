// createOverrideableMockHook.ts
import type { Mock } from 'vitest';
import { vi } from 'vitest';

// Using a more precise type alias instead of Function
type AnyFunction = (...args: any[]) => any;

/**
 * Creates a mock hook function with methods to override and reset its return value
 * @param defaultReturn Default return value of the mocked hook
 * @returns Object containing the mock hook function, override function, and reset function
 */
export function createOverrideableMockHook<
  TParams extends any[],
  TReturn extends object,
>(
  defaultReturn: TReturn,
): {
  mock: Mock<(...args: TParams) => TReturn>;
  override: (overrides: Partial<TReturn>) => void;
  reset: () => void;
} {
  // Create a mock object where each function property is properly mocked
  const mockReturnObj = Object.entries(defaultReturn).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'function') {
        // Cast to AnyFunction to satisfy the type constraints
        acc[key] = vi.fn(value as AnyFunction);
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  // Create the mock function that returns the mock object
  // The params are ignored, just there to satisfy the type
  const mockFn = vi.fn((..._args: TParams) => mockReturnObj as TReturn);

  const override = (overrides: Partial<TReturn>): void => {
    // Update each overridden property in the return object
    Object.entries(overrides).forEach(([key, value]) => {
      if (
        typeof value === 'function' &&
        typeof mockReturnObj[key] === 'function'
      ) {
        (mockReturnObj[key] as Mock).mockImplementation(value as AnyFunction);
      } else {
        mockReturnObj[key] = value;
      }
    });
  };

  const reset = (): void => {
    // Reset all function mocks to their default implementation
    Object.entries(defaultReturn).forEach(([key, value]) => {
      if (
        typeof value === 'function' &&
        typeof mockReturnObj[key] === 'function'
      ) {
        (mockReturnObj[key] as Mock).mockReset();
        (mockReturnObj[key] as Mock).mockImplementation(value as AnyFunction);
      } else {
        mockReturnObj[key] = value;
      }
    });
  };

  return {
    mock: mockFn,
    override,
    reset,
  };
}
