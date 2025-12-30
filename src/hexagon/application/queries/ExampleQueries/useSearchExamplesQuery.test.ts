import type { ExampleTextSearch } from '@learncraft-spanish/shared';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useSearchExamplesQuery } from '@application/queries/ExampleQueries/useSearchExamplesQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useSearchExamplesQuery', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      searchExamplesByText: async () => ({
        examples: createMockExampleWithVocabularyList(5),
        totalCount: 5,
      }),
    });
  });

  it('should fetch examples by search text correctly', async () => {
    // Arrange
    const mockData = createMockExampleWithVocabularyList(5);
    const searchText: ExampleTextSearch = {
      spanishText: 'hola',
      englishText: 'hello',
    };
    overrideMockExampleAdapter({
      searchExamplesByText: async () => ({
        examples: mockData,
        totalCount: mockData.length,
      }),
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText, 1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockData);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to search examples');
    const searchText: ExampleTextSearch = {
      spanishText: 'hola',
      englishText: 'hello',
    };
    overrideMockExampleAdapter({
      searchExamplesByText: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText, 1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to search examples');
    expect(result.current.examples).toBeUndefined();
  });

  it('should handle pagination correctly', async () => {
    // Arrange
    const page1Data = createMockExampleWithVocabularyList(5);
    const page2Data = createMockExampleWithVocabularyList(5);
    const searchText: ExampleTextSearch = {
      spanishText: 'hola',
      englishText: 'hello',
    };

    overrideMockExampleAdapter({
      searchExamplesByText: async (_searchText, page, _limit) => {
        if (page === 1) {
          return { examples: page1Data, totalCount: 10 };
        }
        return { examples: page2Data, totalCount: 10 };
      },
    });

    // Act - Test page 1
    const { result: result1 } = renderHook(
      () => useSearchExamplesQuery(searchText, 1),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    // Assert - Page 1
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    expect(result1.current.examples).toEqual(page1Data);
    expect(result1.current.totalCount).toBe(10);

    // Act - Test page 2
    const { result: result2 } = renderHook(
      () => useSearchExamplesQuery(searchText, 2),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    // Assert - Page 2
    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.examples).toEqual(page2Data);
    expect(result2.current.totalCount).toBe(10);
  });

  it('should return empty array when search returns no results', async () => {
    // Arrange
    const searchText: ExampleTextSearch = {
      spanishText: 'nonexistent',
      englishText: 'nonexistent',
    };
    overrideMockExampleAdapter({
      searchExamplesByText: async () => ({ examples: [], totalCount: 0 }),
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText, 1), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.error).toBeNull();
  });
});
