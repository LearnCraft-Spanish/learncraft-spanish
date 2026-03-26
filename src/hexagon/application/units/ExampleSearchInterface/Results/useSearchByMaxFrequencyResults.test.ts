import {
  mockUseExamplesByMaxFrequency,
  overrideMockUseExamplesByMaxFrequency,
  resetMockUseExamplesByMaxFrequency,
} from '@application/queries/ExampleQueries/useExamplesByMaxFrequency.mock';
import { useSearchByMaxFrequencyResults } from '@application/units/ExampleSearchInterface/Results/useSearchByMaxFrequencyResults';
import { renderHook } from '@testing-library/react';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/ExampleQueries/useExamplesByMaxFrequency',
  () => ({
    useExamplesByMaxFrequency: mockUseExamplesByMaxFrequency,
  }),
);

describe('useSearchByMaxFrequencyResults', () => {
  beforeEach(() => {
    resetMockUseExamplesByMaxFrequency();
  });

  it('should return paginated examples correctly', () => {
    const mockExamples = createMockExampleMaxFrequencyList(30);
    overrideMockUseExamplesByMaxFrequency({
      examples: mockExamples,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useSearchByMaxFrequencyResults({
        highestFirst: true,
        spanglish: 'all',
        vocabularyComplete: undefined,
      }),
    );

    expect(result.current.examples).toEqual(mockExamples.slice(0, 25));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle empty results correctly', () => {
    overrideMockUseExamplesByMaxFrequency({
      examples: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useSearchByMaxFrequencyResults({
        highestFirst: false,
        spanglish: 'all',
        vocabularyComplete: undefined,
      }),
    );

    expect(result.current.examples).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
