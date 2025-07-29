import { overrideMockVocabularyAdapter } from '@application/adapters/vocabularyAdapter.mock';
import { VocabularySchema } from '@LearnCraft-Spanish/shared';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
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
    const mockItem = zocker(VocabularySchema)
      .supply(VocabularySchema.options[0].shape.id, 123)
      .generate();
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

  it('should create verb vocabulary correctly', async () => {
    // Arrange
    const createdId = 1;
    overrideMockVocabularyAdapter({
      createVocabulary: () => Promise.resolve([createdId]),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    const verbCommand = {
      word: 'hablar',
      descriptor: 'to speak',
      subcategoryId: 1,
      verbId: 1,
      conjugationTagIds: [1, 2],
      frequency: 1,
      notes: 'Common verb',
    };
    const createResult = await result.current.createVerbVocabulary([
      verbCommand,
    ]);

    // Assert
    expect(createResult).toEqual([createdId]);
  });

  it('should create non-verb vocabulary correctly', async () => {
    // Arrange
    const createdId = 2;
    overrideMockVocabularyAdapter({
      createVocabulary: () => Promise.resolve([createdId]),
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
    const createResult = await result.current.createNonVerbVocabulary([
      nonVerbCommand,
    ]);

    // Assert
    expect(createResult).toEqual([createdId]);
  });

  it('should delete vocabulary correctly', async () => {
    // Arrange
    overrideMockVocabularyAdapter({
      deleteVocabulary: () => Promise.resolve(1),
    });

    // Act
    const { result } = renderHook(() => useVocabulary(), {
      wrapper: TestQueryClientProvider,
    });
    await result.current.deleteVocabulary(['123']);

    // Assert - verify the hook completes without error
    expect(result.current.deletionError).toBeNull();
  });

  it('should handle creation error correctly', async () => {
    // Arrange
    const testError = new Error('Failed to create vocabulary');
    overrideMockVocabularyAdapter({
      createVocabulary: () => Promise.reject(testError),
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
      word: 'hablar',
      descriptor: 'to speak',
      subcategoryId: 1,
      verbId: 1,
      conjugationTagIds: [1, 2],
      frequency: 1,
      notes: 'Common verb',
    };
    await expect(
      result.current.createVerbVocabulary([verbCommand]),
    ).rejects.toThrow('Failed to create vocabulary');
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
    await expect(result.current.deleteVocabulary(['123'])).rejects.toThrow(
      'Failed to delete vocabulary',
    );
  });

  it.skip('should refetch data when refetch is called', async () => {
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

    // Assert
    expect(result.current.vocabulary).toEqual(newMockData);
  });
});
