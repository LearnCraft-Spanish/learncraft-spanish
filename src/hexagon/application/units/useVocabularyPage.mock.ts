import type { Vocabulary } from '@LearnCraft-Spanish/shared';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

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

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseVocabularyPage,
  override: overrideMockUseVocabularyPage,
  reset: resetMockUseVocabularyPage,
} = createOverrideableMock<
  (
    subcategoryId?: number,
    page?: number,
    pageSize?: number,
    enabled?: boolean,
  ) => VocabularyPageResult
>(() => defaultMockResult);

// Export default for global mocking
export default mockUseVocabularyPage;

// Export the default result for component testing
export { defaultMockResult as defaultResult };
