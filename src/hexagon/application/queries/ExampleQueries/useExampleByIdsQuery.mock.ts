/**
 * Mock for useExampleByIdsQuery hook
 *
 * @example
 * // Basic usage - automatically generates examples with matching IDs
 * vi.mock('@application/queries/ExampleQueries/useExampleByIdsQuery', () => ({
 *   useExampleByIdsQuery: vi.fn((...args) => mockUseExampleByIdsQuery(...args)),
 * }));
 *
 * const ids = [1, 2, 3];
 * const { result } = renderHook(() => useExampleByIdsQuery(ids));
 * // result.current.examples will have IDs [1, 2, 3]
 *
 * @example
 * // Override with loading state
 * overrideMockUseExampleByIdsQuery({
 *   isLoading: true,
 *   examples: undefined,
 * });
 *
 * @example
 * // Override with custom implementation
 * overrideMockUseExampleByIdsQuery((ids) => ({
 *   examples: createExamplesWithIds(ids),
 *   isLoading: false,
 *   error: new Error('Custom error'),
 * }));
 */
import type { UseExampleByIdsQueryReturnType } from '@application/queries/ExampleQueries/useExampleByIdsQuery';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { vi } from 'vitest';

/**
 * Helper function to create examples with specific IDs
 */
export function createExamplesWithIds(ids: number[]): ExampleWithVocabulary[] {
  const examples = createMockExampleWithVocabularyList(ids.length);
  return examples.map((example, index) => ({
    ...example,
    id: ids[index],
  }));
}

/**
 * Default implementation that generates examples matching the provided IDs
 */
const defaultMockImplementation = (
  ids: number[],
): UseExampleByIdsQueryReturnType => {
  if (ids.length === 0) {
    return {
      examples: [],
      isLoading: false,
      error: null,
    };
  }

  return {
    examples: createExamplesWithIds(ids),
    isLoading: false,
    error: null,
  };
};

// Create the mock function
export const mockUseExampleByIdsQuery = vi.fn<
  (ids: number[]) => UseExampleByIdsQueryReturnType
>(defaultMockImplementation);

/**
 * Override the mock implementation
 * @param implementation - Custom implementation or partial return value
 */
export function overrideMockUseExampleByIdsQuery(
  implementation:
    | ((ids: number[]) => UseExampleByIdsQueryReturnType)
    | Partial<UseExampleByIdsQueryReturnType>,
): void {
  if (typeof implementation === 'function') {
    mockUseExampleByIdsQuery.mockImplementation(implementation);
  } else {
    // If it's a partial return value, merge it with defaults
    mockUseExampleByIdsQuery.mockImplementation((ids: number[]) => ({
      examples: createExamplesWithIds(ids),
      isLoading: false,
      error: null,
      ...implementation,
    }));
  }
}

/**
 * Reset the mock to its default implementation
 */
export function resetMockUseExampleByIdsQuery(): void {
  mockUseExampleByIdsQuery.mockReset();
  mockUseExampleByIdsQuery.mockImplementation(defaultMockImplementation);
}

// Export the default mock implementation for global mocking
export default mockUseExampleByIdsQuery;
