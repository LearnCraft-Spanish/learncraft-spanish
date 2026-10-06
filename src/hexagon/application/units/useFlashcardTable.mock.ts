import type { PaginationState } from '@application/units/Pagination/usePagination';
import type {
  UseFlashcardTableProps,
  UseFlashcardTableReturn,
} from '@application/units/useFlashcardTable';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const flashcards = createMockFlashcardList()(2);

const paginationState: PaginationState = {
  totalItems: flashcards.length,
  pageNumber: 1,
  maxPageNumber: 1,
  startIndex: 0,
  endIndex: flashcards.length,
  pageSize: 50,
  isOnFirstPage: true,
  isOnLastPage: true,
  previousPage: () => {},
  nextPage: () => {},
  goToFirstPage: () => {},
  goToPage: () => {},
};

const defaultMockUseFlashcardTable: UseFlashcardTableReturn = {
  allFlashcards: flashcards,
  displayFlashcards: flashcards,
  paginationState,
  onGoingToQuiz: () => {},
  error: null,
  selectedIds: [],
  isSelected: () => false,
  addToSelectedIds: () => {},
  removeFromSelectedIds: () => {},
  selectAllOnPage: () => {},
  clearSelection: () => {},
  deleteFlashcard: async () => 0,
  deleteSelectedFlashcards: async () => 0,
  isSomethingPending: false,
  lessonPopup: {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  },
  isRemovingFlashcard: () => false,
};

export const {
  mock: mockUseFlashcardTable,
  override: overrideMockUseFlashcardTable,
  reset: resetMockUseFlashcardTable,
} = createOverrideableMockHook<
  [UseFlashcardTableProps],
  UseFlashcardTableReturn
>(defaultMockUseFlashcardTable);

export default mockUseFlashcardTable;
