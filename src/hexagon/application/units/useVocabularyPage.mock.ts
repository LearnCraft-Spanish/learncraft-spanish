import type { Vocabulary } from '@LearnCraft-Spanish/shared';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// Interface from the real hook
interface VocabularyPageResult {
  items: Vocabulary[];
  isLoading: boolean;
  isCountLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  totalCount: number | null;
  totalPages: number | null;
  hasMorePages: boolean;
  page: number;
  pageSize: number;
}

// Default mock implementation that provides happy-path data
const defaultMockResult: VocabularyPageResult = {
  items: createMockVocabularyList(10),
  isLoading: false,
  isCountLoading: false,
  isFetching: false,
  error: null,
  totalCount: 32,
  totalPages: 4,
  hasMorePages: true,
  page: 1,
  pageSize: 10,
};

// Create the mock hook with default implementation
export const mockUseVocabularyPage = createTypedMock<
  (
    subcategoryId?: number,
    page?: number,
    pageSize?: number,
    enabled?: boolean,
  ) => VocabularyPageResult
>().mockImplementation(() => defaultMockResult);

// Setup function to configure the mock for tests
export const overrideMockUseVocabularyPage = (
  config: Partial<VocabularyPageResult> = {},
) => {
  // Create a new result with defaults and overrides
  const mockResult = {
    ...defaultMockResult,
    ...config,
  };

  // Reset and configure the mock
  mockUseVocabularyPage.mockImplementation(() => mockResult);
  return mockResult;
};

// Export default for global mocking
export default mockUseVocabularyPage;
