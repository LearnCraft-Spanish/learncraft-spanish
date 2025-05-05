import type {
  UseNonVerbCreationResult,
  VocabularyPaginationState,
} from './useNonVerbCreation';
import { callMockUseVocabularyTable } from '@application/implementations/vocabularyTable/useVocabularyTable.mock';
import { callMockUseVocabularyPage } from '@application/units/useVocabularyPage.mock';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// ---- Reusable mock data
const mockSubcategories = createMockSubcategoryList(5).filter(
  (subcategory) => subcategory.partOfSpeech !== 'Verb',
);
const mockTableHook = callMockUseVocabularyTable();
const mockSaveVocabulary =
  createTypedMock<() => Promise<boolean>>().mockResolvedValue(true);
const mockSetSubcategoryId = createTypedMock<(id: string) => void>();
const mockGoToNextPage = createTypedMock<() => void>();
const mockGoToPreviousPage = createTypedMock<() => void>();

// ---- Create a proper pagination state that matches VocabularyPaginationState
const vocabularyPageResult = callMockUseVocabularyPage();
const mockPagination: VocabularyPaginationState = {
  vocabularyItems: vocabularyPageResult.items,
  isLoading: vocabularyPageResult.isLoading,
  isCountLoading: vocabularyPageResult.isCountLoading,
  isFetching: vocabularyPageResult.isFetching,
  error: vocabularyPageResult.error,
  totalCount: vocabularyPageResult.totalCount,
  totalPages: vocabularyPageResult.totalPages,
  hasMorePages: vocabularyPageResult.hasMorePages,
  currentPage: vocabularyPageResult.page,
  pageSize: vocabularyPageResult.pageSize,
  goToNextPage: mockGoToNextPage,
  goToPreviousPage: mockGoToPreviousPage,
};

// ---- Default mock result
const defaultResult: UseNonVerbCreationResult = {
  nonVerbSubcategories: mockSubcategories,
  loadingSubcategories: false,
  selectedSubcategoryId: mockSubcategories[0].id.toString(),
  setSelectedSubcategoryId: mockSetSubcategoryId,

  creating: false,
  creationError: null,

  tableHook: mockTableHook,

  saveVocabulary: mockSaveVocabulary,

  currentVocabularyPagination: mockPagination,
};

// ---- Typed vi.fn mock
export const mockUseNonVerbCreation =
  createTypedMock<() => UseNonVerbCreationResult>().mockReturnValue(
    defaultResult,
  );

// ---- Per-test override
export const overrideMockUseNonVerbCreation = (
  config: Partial<UseNonVerbCreationResult> = {},
) => {
  const result = { ...defaultResult, ...config };
  mockUseNonVerbCreation.mockReturnValue(result);
  return result;
};

// ---- Shortcut for calling
export const callMockUseNonVerbCreation = () => mockUseNonVerbCreation();

// Export default for global mocking
export default mockUseNonVerbCreation;

// Export the default result for defensive test setup
export { defaultResult };
