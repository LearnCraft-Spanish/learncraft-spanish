import { overrideMockVocabularyAdapter } from '@application/adapters/vocabularyAdapter.mock';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';
import { useVocabularyPage } from './useVocabularyPage';

describe('useVocabularyPage', () => {
  beforeEach(() => {
    // Reset adapter mock before each test
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.resolve([]),
      getVocabularyCount: () => Promise.resolve(0),
    });
  });

  it('should fetch and return vocabulary items', async () => {
    // Arrange
    const mockItems = createMockVocabularyList(10);
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.resolve(mockItems),
      getVocabularyCount: () => Promise.resolve(32),
    });

    // Act
    const { result } = renderHook(() => useVocabularyPage(1, 1, 10, true), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.items).toEqual(mockItems));
    expect(result.current.totalCount).toBe(32);
    expect(result.current.totalPages).toBe(4); // 32 items / 10 per page = 4 pages
    expect(result.current.hasMorePages).toBe(true);
  });

  it('should handle disabled state', async () => {
    // Act
    const { result } = renderHook(() => useVocabularyPage(0, 1, 10, false), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    expect(result.current.items).toEqual([]);
    expect(result.current.totalCount).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors', async () => {
    // Arrange
    const testError = new Error('Failed to fetch vocabulary');
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.reject(testError),
      getVocabularyCount: () => Promise.resolve(0),
    });

    // Act
    const { result } = renderHook(() => useVocabularyPage(1, 1, 10, true), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.error).toBe(testError));
    expect(result.current.items).toEqual([]);
  });
});
