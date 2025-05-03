import {
  mockVocabularyAdapter,
  overrideMockVocabularyAdapter,
} from '@application/adapters/vocabularyAdapter.mock';
import { describe, expect, it, vi } from 'vitest';
import { createMockVocabulary } from '../factories/vocabularyFactories';

// This is a mock of a use case that would typically be in its own file
// In a real implementation, you would import the actual use case and its mock
const mockUseVocabularySearch = vi.fn().mockReturnValue({
  results: [],
  loading: false,
  error: null,
  search: vi.fn().mockResolvedValue([]),
});

// Mock the use case module
vi.mock('@application/useCases/useVocabularySearch', () => ({
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
  useVocabularySearch: () => mockUseVocabularySearch(),
}));

describe('hexagonal architecture testing example: use cases', () => {
  it('should test a use case that depends on an adapter', async () => {
    // Arrange: Set up test data
    const searchResults = [
      createMockVocabulary({ id: 1, word: 'hola' }),
      createMockVocabulary({ id: 2, word: 'adios' }),
    ];

    // Override the adapter behavior that the use case will call
    overrideMockVocabularyAdapter({
      searchVocabulary: searchResults,
    });

    // Act: Call the use case that internally uses the adapter
    const { search } = mockUseVocabularySearch();
    const result = await search('hola');

    // Assert: Check the result from the use case
    expect(result).toEqual(searchResults);

    // Verify the adapter was called with the right parameters
    expect(mockVocabularyAdapter.searchVocabulary).toHaveBeenCalledWith('hola');
    expect(mockVocabularyAdapter.searchVocabulary).toHaveBeenCalledTimes(1);
  });

  it('should handle errors from the adapter', async () => {
    // Arrange: Configure the adapter to throw an error
    const testError = new Error('Search failed');
    overrideMockVocabularyAdapter({
      searchVocabulary: testError,
    });

    // Act & Assert: The use case should handle the error appropriately
    const { search } = mockUseVocabularySearch();
    await expect(search('query')).rejects.toThrow('Search failed');
  });

  it('should demonstrate testing a use case with multiple adapter dependencies', async () => {
    // This example would involve additional adapter mocks
    // For a real implementation, you would import and configure all needed adapter mocks

    // Arrange: Configure the vocabulary adapter
    const vocabularyItems = [createMockVocabulary({ word: 'palabra' })];
    overrideMockVocabularyAdapter({
      getVocabulary: vocabularyItems,
    });

    // Here you would configure other adapter mocks as needed

    // Act: Call use case that depends on multiple adapters
    const result = await mockVocabularyAdapter.getVocabulary();

    // Assert: Verify results
    expect(result).toEqual(vocabularyItems);
  });
});
