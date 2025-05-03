import {
  mockVocabularyAdapter,
  overrideMockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import { describe, expect, it } from 'vitest';
import { createMockVocabulary } from '../factories/vocabularyFactories';

// Example of a test suite that uses the hexagonal architecture testing setup
describe('hexagonal architecture testing example: adapters', () => {
  it('should use default mock vocabulary adapter implementation', async () => {
    // Act: Call the mock method
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Default mock data is returned
    expect(result).toHaveLength(3); // Default factory creates 3 items
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('word');
  });

  it('should allow overriding mock behavior for specific tests', async () => {
    // Arrange: Override the mock to return custom data
    const customVocabulary = [
      createMockVocabulary({ id: 99, word: 'customWord' }),
    ];
    overrideMockVocabularyAdapter({
      getVocabulary: customVocabulary,
    });

    // Act: Call the mock method
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Custom data is returned
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(99);
    expect(result[0].word).toBe('customWord');
  });

  it('should allow mocking error responses', async () => {
    // Arrange: Override the mock to throw an error
    const testError = new Error('Test error');
    overrideMockVocabularyAdapter({
      getVocabulary: testError,
    });

    // Act & Assert: The method should reject with the error
    await expect(mockVocabularyAdapter.getVocabulary()).rejects.toThrow(
      'Test error',
    );
  });

  it('should be able to reset to default behavior', async () => {
    // Arrange: First override the mock
    overrideMockVocabularyAdapter({
      getVocabulary: [createMockVocabulary({ word: 'custom' })],
    });

    // Act: Call the mock method
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Default mock data is returned after reset
    expect(result).toHaveLength(3); // Default factory creates 3 items
    expect(result[0].word).not.toBe('custom');
  });
});
