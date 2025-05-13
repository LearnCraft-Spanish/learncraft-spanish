// createOverrideableMock.ts
import type { Mock } from 'vitest';
import { vi } from 'vitest';

// Using a more precise type alias instead of Function
type AnyFunction = (...args: any[]) => any;

/**
 * Creates a mock object with methods to override and reset it
 * @param defaultImpl Default implementation of the mocked object
 * @returns Object containing the mock, override function, and reset function
 */
export function createOverrideableMock<T extends object>(
  defaultImpl: T,
): {
  mock: T & { [K in keyof T]: T[K] extends AnyFunction ? Mock : T[K] };
  override: (overrides: Partial<T>) => T;
  reset: () => void;
} {
  // Create a mock object where each function property is properly mocked
  const mockObj = Object.entries(defaultImpl).reduce(
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

  const override = (overrides: Partial<T>): T => {
    // Update each overridden property
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === 'function' && typeof mockObj[key] === 'function') {
        (mockObj[key] as Mock).mockImplementation(value as AnyFunction);
      } else {
        mockObj[key] = value;
      }
    });
    return mockObj as T;
  };

  const reset = (): void => {
    // Reset all function mocks to their default implementation
    Object.entries(defaultImpl).forEach(([key, value]) => {
      if (typeof value === 'function' && typeof mockObj[key] === 'function') {
        (mockObj[key] as Mock).mockReset();
        (mockObj[key] as Mock).mockImplementation(value as AnyFunction);
      } else {
        mockObj[key] = value;
      }
    });
  };

  // Cast the mock object to the expected return type
  return {
    mock: mockObj as T & {
      [K in keyof T]: T[K] extends AnyFunction ? Mock : T[K];
    },
    override,
    reset,
  };
}
