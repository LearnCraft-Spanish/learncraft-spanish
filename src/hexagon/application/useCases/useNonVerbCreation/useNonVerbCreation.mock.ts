import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { UseNonVerbCreationResult } from './useNonVerbCreation.types';
import { defaultMockResult as defaultTableHook } from '@application/implementations/vocabularyTable/useVocabularyTable.mock';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { mockUseVocabularyPage } from 'src/hexagon/application/queries/useVocabularyQuery.mock';
import { vi } from 'vitest';

// ---- Reusable mock data
const mockSubcategories = createMockSubcategoryList(5).filter(
  (subcategory) => subcategory.partOfSpeech !== 'Verb',
);

// Create simple mocks
const mockSaveVocabulary = vi
  .fn<() => Promise<number[]>>()
  .mockResolvedValue([1, 2, 3]);
const mockSetSubcategoryId = vi.fn<(id: string) => void>();
const mockNextPage = vi.fn<() => void>();
const mockPreviousPage = vi.fn<() => void>();
const mockResetPagination = vi.fn<() => void>();
const countOfVocabulary = 25;

// ---- Create a proper pagination state that matches VocabularyPaginationState
const vocabularyPageResult = mockUseVocabularyPage();
const mockPagination: QueryPaginationState = {
  page: vocabularyPageResult.page,
  queryPage: vocabularyPageResult.page,
  pageSize: countOfVocabulary,
  pagesPerQuery: 1,
  pageWithinQueryBatch: 1,
  maxPageNumber: 1,
  maxPageName: '1',
  previousPage: mockPreviousPage,
  nextPage: mockNextPage,
  resetPagination: mockResetPagination,
};

// ---- Default mock result
const defaultResult: UseNonVerbCreationResult = {
  nonVerbSubcategories: mockSubcategories,
  loadingSubcategories: false,
  selectedSubcategoryId: mockSubcategories[0].id.toString(),
  setSelectedSubcategoryId: mockSetSubcategoryId,

  creating: false,
  creationError: null,

  // Use the static default table hook instead of calling the mock
  tableHook: defaultTableHook,

  saveVocabulary: mockSaveVocabulary,

  currentVocabularyPagination: mockPagination,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseNonVerbCreation,
  override: overrideMockUseNonVerbCreation,
  reset: resetMockUseNonVerbCreation,
} = createOverrideableMock<() => UseNonVerbCreationResult>(() => defaultResult);

// Export default for global mocking
export default mockUseNonVerbCreation;

// Export the default result for defensive test setup
export { defaultResult };
