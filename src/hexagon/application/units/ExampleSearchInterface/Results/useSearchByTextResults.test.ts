import {
  mockUseSearchExamplesQuery,
  overrideMockUseSearchExamplesQuery,
  resetMockUseSearchExamplesQuery,
} from '@application/queries/ExampleQueries/useSearchExamplesQuery.mock';
import { useSearchByTextResults } from '@application/units/ExampleSearchInterface/Results/useSearchByTextResults';
import { renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/ExampleQueries/useSearchExamplesQuery', () => ({
  useSearchExamplesQuery: mockUseSearchExamplesQuery,
}));

describe('useSearchByTextResults', () => {
  beforeEach(() => {
    resetMockUseSearchExamplesQuery();
  });

  it('should return paginated examples correctly', () => {
    const mockExamples = createMockExampleWithVocabularyList(30);
    overrideMockUseSearchExamplesQuery({
      examples: mockExamples,
      totalCount: 30,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useSearchByTextResults({
        spanishString: 'hola',
        englishString: 'hello',
      }),
    );

    expect(result.current.examples).toEqual(mockExamples.slice(0, 25));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle empty search results correctly', () => {
    overrideMockUseSearchExamplesQuery({
      examples: [],
      totalCount: 0,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useSearchByTextResults({
        spanishString: 'nonexistent',
        englishString: 'nonexistent',
      }),
    );

    expect(result.current.examples).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle query errors correctly', () => {
    const testError = new Error('Failed to search examples');
    overrideMockUseSearchExamplesQuery({
      examples: undefined,
      totalCount: undefined,
      isLoading: false,
      error: testError,
    });

    const { result } = renderHook(() =>
      useSearchByTextResults({
        spanishString: 'error',
        englishString: 'error',
      }),
    );

    expect(result.current.examples).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(testError);
  });
});
