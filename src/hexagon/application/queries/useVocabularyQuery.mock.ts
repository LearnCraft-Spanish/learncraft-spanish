import type { VocabularyQueryResult } from './useVocabularyQuery';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Default mock implementation that provides happy-path data
const defaultMockResult: VocabularyQueryResult = {
  items: createMockVocabularyList(10),
  isLoading: false,
  isCountLoading: false,
  error: null,
  totalCount: 32,
  page: 1,
  pageSize: 10,
  changePage: () => {},
  setCanPrefetch: () => {},
  createVocabulary: () => Promise.resolve([]),
  deleteVocabulary: () => Promise.resolve(0),
  creating: false,
  deleting: false,
  creationError: null,
  deletionError: null,
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
  ) => VocabularyQueryResult
>(() => defaultMockResult);

// Export default for global mocking
export default mockUseVocabularyPage;

// Export the default result for component testing
export { defaultMockResult as defaultResult };
