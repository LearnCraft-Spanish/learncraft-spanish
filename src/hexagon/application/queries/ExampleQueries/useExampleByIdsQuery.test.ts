import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExampleByIdsQuery } from '@application/queries/ExampleQueries/useExampleByIdsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useExampleByIdsQuery', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      getExamplesByIds: async () => ({
        examples: createMockExampleWithVocabularyList(2),
      }),
    });
  });

  it('should fetch examples by ids correctly', async () => {
    // Arrange
    const mockData = createMockExampleWithVocabularyList(2);
    overrideMockExampleAdapter({
      getExamplesByIds: async () => ({
        examples: mockData,
      }),
    });

    // Act
    const { result } = renderHook(() => useExampleByIdsQuery([1, 2]), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples?.examples).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch examples');
    overrideMockExampleAdapter({
      getExamplesByIds: async () => {
        throw testError;
      },
    });

    // Act
    const { result } = renderHook(() => useExampleByIdsQuery([1, 2]), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch examples');
    expect(result.current.examples).toBeUndefined();
  });

  it('should return undefined examples when ids array is empty', async () => {
    // Arrange
    overrideMockExampleAdapter({
      getExamplesByIds: async () => ({
        examples: [],
      }),
    });

    // Act
    const { result } = renderHook(() => useExampleByIdsQuery([]), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples?.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
