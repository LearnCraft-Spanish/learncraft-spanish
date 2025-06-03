/**
 * Utility functions to make testing with mocks easier.
 * This provides common patterns for testing hooks and components that use mocks.
 */
import { vi } from 'vitest';

/**
 * Sets up a hook mock for a test and returns the cleanup function
 * @param mockModule - The module path to mock
 * @param exportName - The name of the hook export
 * @param mockImplementation - The function that returns the mock
 * @returns A cleanup function to reset the mock
 *
 * @example
 * // Setup
 * const cleanup = setupHookMock(
 *   '@application/units/useVocabulary',
 *   'useVocabulary',
 *   mockUseVocabulary
 * );
 *
 * // Test code...
 *
 * // Cleanup
 * cleanup();
 */
export function setupHookMock(
  mockModule: string,
  exportName: string,
  mockImplementation: () => any,
): () => void {
  // Create the mock
  vi.mock(mockModule, () => ({
    [exportName]: mockImplementation,
  }));

  // Return a cleanup function
  return () => {
    vi.unmock(mockModule);
  };
}

/**
 * Setup multiple mock hooks for a test
 * @param mocks - Array of mock configurations
 * @returns A single cleanup function that resets all mocks
 *
 * @example
 * const cleanup = setupHookMocks([
 *   {
 *     module: '@application/units/useVocabulary',
 *     exportName: 'useVocabulary',
 *     implementation: mockUseVocabulary
 *   },
 *   {
 *     module: '@application/units/useSubcategories',
 *     exportName: 'useSubcategories',
 *     implementation: mockUseSubcategories
 *   }
 * ]);
 *
 * // Test code...
 *
 * cleanup();
 */
export function setupHookMocks(
  mocks: Array<{
    module: string;
    exportName: string;
    implementation: () => any;
  }>,
): () => void {
  // Setup each mock
  const cleanupFunctions = mocks.map(({ module, exportName, implementation }) =>
    setupHookMock(module, exportName, implementation),
  );

  // Return a cleanup function that calls all cleanup functions
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Creates a test builder pattern for setting up common mocking scenarios
 * @returns A builder object with methods to configure mocks
 *
 * @example
 * const { withMock, withError, withLoading, run } = createMockTestBuilder();
 *
 * // Configure and run test with a loading state
 * run(
 *   withMock('useVocabulary', mockUseVocabulary)
 *     .withLoading()
 *     .build(),
 *   () => {
 *     // Test with loading state
 *   }
 * );
 *
 * // Configure and run test with an error state
 * run(
 *   withMock('useVocabulary', mockUseVocabulary)
 *     .withError(new Error('Test error'))
 *     .build(),
 *   () => {
 *     // Test with error state
 *   }
 * );
 */
export function createMockTestBuilder() {
  interface MockConfig {
    exportName: string;
    mockFn: () => any;
    overrideFn?: (config: any) => any;
    mockState?: any;
  }

  const mocks: MockConfig[] = [];

  // Define the builder object first
  const builder = {
    withMock: (
      exportName: string,
      mockFn: () => any,
      overrideFn?: (config: any) => any,
    ) => {
      mocks.push({ exportName, mockFn, overrideFn });
      return builder;
    },

    withLoading: () => {
      if (mocks.length === 0)
        throw new Error('Add a mock first with withMock()');
      const lastMock = mocks[mocks.length - 1];
      lastMock.mockState = { loading: true, isLoading: true };
      return builder;
    },

    withError: (error: Error) => {
      if (mocks.length === 0)
        throw new Error('Add a mock first with withMock()');
      const lastMock = mocks[mocks.length - 1];
      lastMock.mockState = { error, loading: false, isLoading: false };
      return builder;
    },

    build: () => {
      const result = mocks.map(
        ({ exportName, mockFn, overrideFn, mockState }) => {
          let implementation = mockFn;

          // If there's a state to apply and an override function
          if (mockState && overrideFn) {
            implementation = () => overrideFn(mockState);
          }

          return {
            exportName,
            implementation,
          };
        },
      );

      // Reset for next build
      mocks.length = 0;

      return result;
    },

    run: (
      mockConfigs: Array<{ exportName: string; implementation: () => any }>,
      testFn: () => void,
    ) => {
      // Setup mocks
      const cleanup = setupHookMocks(
        mockConfigs.map(({ exportName, implementation }) => ({
          module: `@application/units/${exportName}`,
          exportName,
          implementation,
        })),
      );

      try {
        // Run the test
        testFn();
      } finally {
        // Always cleanup
        cleanup();
      }
    },
  };

  return builder;
}
