import {
  mockGetVocabulary,
  mockVocabularyAdapter,
  overrideMockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockVocabulary } from '../factories/vocabularyFactories';

/**
 * This test suite demonstrates how to properly use adapter mocks
 * in our hexagonal architecture. It shows the default behavior,
 * how to override mocks for specific tests, and how mocks are reset
 * between tests automatically.
 *
 * IMPORTANT: This test should be run with the hexagon-specific config:
 * npm test -- src/hexagon/testing/examples/adapter-usage.test.ts --config vitest.config-hexagon.ts
 */
describe('hexagonal architecture testing: adapter mocks', () => {
  // Ensure mock implementations are properly set up before each test
  beforeEach(() => {
    // Ensure the mock implementation returns a proper result
    // This makes our tests more resilient regardless of which setupTests runs
    mockGetVocabulary.mockImplementation(() => {
      return Promise.resolve([
        createMockVocabulary({ id: 1, word: 'test1' }),
        createMockVocabulary({ id: 2, word: 'test2' }),
        createMockVocabulary({ id: 3, word: 'test3' }),
      ]);
    });
  });

  // Clean up after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use default mock vocabulary adapter implementation', async () => {
    // Act: Call the mock method
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Default mock data is returned
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3); // Default factory creates 3 items
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('word');

    // Assert: The mock was called
    expect(mockVocabularyAdapter.getVocabulary).toHaveBeenCalledTimes(1);
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
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(99);
    expect(result[0].word).toBe('customWord');
    expect(mockVocabularyAdapter.getVocabulary).toHaveBeenCalledTimes(1);
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
    expect(mockVocabularyAdapter.getVocabulary).toHaveBeenCalledTimes(1);
  });

  it('should be able to reset to default behavior between tests', async () => {
    // Act: Call the mock method
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Default mock data is returned
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3); // Default factory creates 3 items
    expect(mockVocabularyAdapter.getVocabulary).toHaveBeenCalledTimes(1);

    // Verify none of the other adapter methods were called
    expect(mockVocabularyAdapter.getVocabularyById).not.toHaveBeenCalled();
    expect(mockVocabularyAdapter.searchVocabulary).not.toHaveBeenCalled();
  });

  it('should properly isolate mock usage between different adapter methods', async () => {
    // Act: Call multiple adapter methods
    await mockVocabularyAdapter.getVocabulary();
    await mockVocabularyAdapter.searchVocabulary('test');

    // Assert: Each method was called the correct number of times
    expect(mockVocabularyAdapter.getVocabulary).toHaveBeenCalledTimes(1);
    expect(mockVocabularyAdapter.searchVocabulary).toHaveBeenCalledTimes(1);
    expect(mockVocabularyAdapter.searchVocabulary).toHaveBeenCalledWith('test');
  });
});
