import {
  mockUseExamplesByRecentlyModified,
  overrideMockUseExamplesByRecentlyModified,
  resetMockUseExamplesByRecentlyModified,
} from '@application/queries/ExampleQueries/useExamplesByRecentlyModified.mock';
import { useSearchByDatePagination } from '@application/units/ExampleSearchInterface/Results/useSearchByDatePagination';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/ExampleQueries/useExamplesByRecentlyModified',
  () => ({
    useExamplesByRecentlyModified: mockUseExamplesByRecentlyModified,
  }),
);

describe('useSearchByDatePagination', () => {
  beforeEach(() => {
    resetMockUseExamplesByRecentlyModified();
  });

  it('should return paginated examples by date correctly', async () => {
    const mockExamples = createMockExampleWithVocabularyList(30);

    overrideMockUseExamplesByRecentlyModified({
      examples: mockExamples,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSearchByDatePagination(), {
      wrapper: TestQueryClientProvider,
    });

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toHaveLength(25);
    expect(result.current.examples[0].id).toBe(mockExamples[0].id);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty results correctly', async () => {
    overrideMockUseExamplesByRecentlyModified({
      examples: [],
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSearchByDatePagination(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle query errors correctly', async () => {
    const testError = new Error('Failed to fetch examples by date');

    overrideMockUseExamplesByRecentlyModified({
      examples: undefined,
      isLoading: false,
      error: testError,
    });

    const { result } = renderHook(() => useSearchByDatePagination(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Failed to fetch examples by date',
    );
    expect(result.current.examples).toEqual([]);
  });
});
