import { overrideMockVocabularyAdapter } from '@application/adapters/vocabularyAdapter.mock';
import { renderHook, waitFor } from '@testing-library/react';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';
import { useVocabulary } from './useVocabulary';

describe('useVocabulary', () => {
  it('should fetch vocabulary data correctly', async () => {
    // Arrange
    const mockData = createMockVocabularyList(3);
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.resolve(mockData),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    // Initial state should show loading
    expect(result.current.loading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vocabulary).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors correctly', async () => {
    // Arrange
    const testError = new Error('Failed to fetch vocabulary');
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.reject(testError),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch vocabulary');
    expect(result.current.vocabulary).toEqual([]);
  });

  it('should get vocabulary by id correctly', async () => {
    // Arrange
    const mockItem = createMockVocabulary({ id: 123 });
    overrideMockVocabularyAdapter({
      getVocabularyById: () => Promise.resolve(mockItem),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const itemResult = await result.current.getById('123');

    // Assert
    expect(itemResult).toEqual(mockItem);
  });

  it('should search vocabulary correctly', async () => {
    // Arrange
    const searchResults = createMockVocabularyList(2, { word: 'test' });
    overrideMockVocabularyAdapter({
      searchVocabulary: () => Promise.resolve(searchResults),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const searchResult = await result.current.search('test');

    // Assert
    expect(searchResult).toEqual(searchResults);
  });

  it('should create verb vocabulary correctly', async () => {
    // Arrange
    const createdVerb = createMockVocabulary({
      word: 'hablar',
      descriptor: 'to speak',
      id: 1,
    });
    overrideMockVocabularyAdapter({
      createVerb: () => Promise.resolve(createdVerb),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const verbCommand = {
      infinitive: 'hablar',
      translation: 'to speak',
      isRegular: true,
    };
    const createResult = await result.current.createVerb(verbCommand);

    // Assert
    expect(createResult).toEqual(createdVerb);
  });

  it('should create non-verb vocabulary correctly', async () => {
    // Arrange
    const createdNonVerb = createMockVocabulary({
      word: 'casa',
      descriptor: 'house',
      id: 2,
    });
    overrideMockVocabularyAdapter({
      createNonVerbVocabulary: () => Promise.resolve(createdNonVerb),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const nonVerbCommand = {
      word: 'casa',
      descriptor: 'house',
      subcategoryId: 1,
      frequency: 1,
    };
    const createResult = await result.current.createNonVerb(nonVerbCommand);

    // Assert
    expect(createResult).toEqual(createdNonVerb);
  });

  it('should create batch vocabulary correctly', async () => {
    // Arrange
    const createdItems = [
      createMockVocabulary({ word: 'perro', descriptor: 'dog', id: 1 }),
      createMockVocabulary({ word: 'gato', descriptor: 'cat', id: 2 }),
    ];
    overrideMockVocabularyAdapter({
      createVocabularyBatch: () => Promise.resolve(createdItems),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const batchCommands = [
      { word: 'perro', descriptor: 'dog', subcategoryId: 1, frequency: 1 },
      { word: 'gato', descriptor: 'cat', subcategoryId: 1, frequency: 1 },
    ];
    const batchResult = await result.current.createBatch(batchCommands);

    // Assert
    expect(batchResult).toEqual(createdItems);
  });

  it('should delete vocabulary correctly', async () => {
    // Arrange
    overrideMockVocabularyAdapter({
      deleteVocabulary: (_id: string) => Promise.resolve(1),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    await result.current.deleteVocabulary('123');

    // Assert - verify the hook completes without error
    expect(result.current.deletionError).toBeNull();
  });

  it('should handle creation error correctly', async () => {
    // Arrange
    const testError = new Error('Failed to create vocabulary');
    overrideMockVocabularyAdapter({
      createVerb: () => Promise.reject(testError),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - initial state
    expect(result.current.creating).toBe(false);
    expect(result.current.creationError).toBeNull();

    // Act - trigger error
    const verbCommand = {
      infinitive: 'hablar',
      translation: 'to speak',
      isRegular: true,
    };
    await expect(result.current.createVerb(verbCommand)).rejects.toThrow(
      'Failed to create vocabulary',
    );
  });

  it('should handle deletion error correctly', async () => {
    // Arrange
    const testError = new Error('Failed to delete vocabulary');
    overrideMockVocabularyAdapter({
      deleteVocabulary: () => Promise.reject(testError),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - initial state
    expect(result.current.deleting).toBe(false);
    expect(result.current.deletionError).toBeNull();

    // Act - trigger error
    await expect(result.current.deleteVocabulary('123')).rejects.toThrow(
      'Failed to delete vocabulary',
    );
  });

  it('should refetch data when refetch is called', async () => {
    // Arrange
    const mockData = createMockVocabularyList(3);
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.resolve(mockData),
    });

    // Act
    const { result, rerender } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Change mock data for refetch
    const newMockData = createMockVocabularyList(2);
    overrideMockVocabularyAdapter({
      getVocabulary: () => Promise.resolve(newMockData),
    });

    // Re-render the hook to pick up the new mock
    rerender();

    // Trigger refetch
    await result.current.refetch();

    // Assert
    await waitFor(() => expect(result.current.vocabulary).toEqual(newMockData));
  });
});
