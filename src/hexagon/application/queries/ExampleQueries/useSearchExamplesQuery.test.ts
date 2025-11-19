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
      }),
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.page).toBe(1);
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
    const { result } = renderHook(() => useSearchExamplesQuery(searchText), {
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
          return { examples: page1Data };
        }
        return { examples: page2Data };
      },
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - Initial page
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(page1Data);
    expect(result.current.page).toBe(1);

    // Change page
    result.current.changePage(2);
    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(page2Data);
  });

  it('should return undefined examples when search returns empty', async () => {
    // Arrange
    const searchText: ExampleTextSearch = {
      spanishText: 'nonexistent',
      englishText: 'nonexistent',
    };
    overrideMockExampleAdapter({
      searchExamplesByText: async () => ({
        examples: [],
      }),
    });

    // Act
    const { result } = renderHook(() => useSearchExamplesQuery(searchText), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
