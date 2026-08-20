import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { UseFlashcardFinderReturnType } from '@application/useCases/useFlashcardFinder/useFlashcardFinder';
import type { SrsDifficulty } from '@domain/srs';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultPagination: QueryPaginationState = {
  page: 1,
  queryPage: 1,
  pageSize: 25,
  pagesPerQuery: 6,
  pageWithinQueryBatch: 0,
  maxPageNumber: 0,
  maxPageName: 'many',
  nextPage: vi.fn<() => void>(),
  previousPage: vi.fn<() => void>(),
  goToPage: vi.fn<(page: number) => void>(),
  resetPagination: vi.fn<() => void>(),
};

const defaultExampleQuery: UseExampleQueryReturnType = {
  isLoading: false,
  isDependenciesLoading: false,
  filteredExamples: null,
  totalCount: null,
  error: null,
  page: 1,
  pageSize: 150,
  changeQueryPage: vi.fn<(page: number) => void>(),
  setCanPrefetch: vi.fn<(canPrefetch: boolean) => void>(),
  updatePageSize: vi.fn<(newPageSize: number) => void>(),
};

const defaultLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

const defaultSkillTagSearch: UseSkillTagSearchReturnType = {
  tagSearchTerm: '',
  tagSuggestions: [],
  updateTagSearchTerm:
    vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  removeTagFromSuggestions: vi.fn<(tagId: string) => void>(),
  addTagBackToSuggestions: vi.fn<(tagId: string) => void>(),
  isLoading: false,
  error: null,
};

const defaultFlashcardsQuery: UseStudentFlashcardsReturn = {
  flashcards: createMockFlashcardList()(3),
  flashcardsDueForReview: createMockFlashcardList()(2),
  customFlashcards: createMockFlashcardList()(1),
  customFlashcardsDueForReview: createMockFlashcardList()(1),
  audioFlashcards: createMockFlashcardList()(2),
  collectedExamples: undefined,
  isLoading: false,
  error: null,
  updateFlashcardInterval: vi.fn<
    (exampleId: number, difficulty: SrsDifficulty) => Promise<number>
  >(async () => 1),
  getRandomFlashcards: vi.fn<() => Flashcard[]>(() => []),
  isFlashcardCollected: vi.fn<() => boolean>(() => false),
  isExampleCollected: vi.fn<() => boolean>(() => false),
  isAddingFlashcard: vi.fn<() => boolean>(() => false),
  isRemovingFlashcard: vi.fn<() => boolean>(() => false),
  isCustomFlashcard: vi.fn<() => boolean>(() => false),
  isPendingFlashcard: vi.fn<() => boolean>(() => false),
  createFlashcards: vi.fn<
    (examples: ExampleWithVocabulary[]) => Promise<Flashcard[]>
  >(async () => []),
  deleteFlashcards: vi.fn<(exampleIds: number[]) => Promise<number>>(
    async () => 0,
  ),
  updateFlashcards: vi.fn<() => Promise<Flashcard[]>>(async () => []),
  getFlashcardByExampleId: vi.fn<() => Flashcard | undefined>(() => undefined),
};

const defaultExampleFilter = {
  toLessonNumber: 8,
  isAdmin: false,
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
} as unknown as UseCombinedFiltersReturnType;

export const defaultMockUseFlashcardFinder: UseFlashcardFinderReturnType = {
  pagination: defaultPagination,
  exampleFilter: defaultExampleFilter,
  exampleQuery: defaultExampleQuery,
  displayExamples: [],
  flashcardsQuery: defaultFlashcardsQuery,
  totalPages: null,
  lessonPopup: defaultLessonPopup,
  skillTagSearch: defaultSkillTagSearch,
  resetFilters: vi.fn<() => void>(),
  studentDisplayName: 'Alex Rivera',
  filteredExamplesLoading: false,
  initialLoading: false,
  error: null,
};

export const {
  mock: mockUseFlashcardFinder,
  override: overrideMockUseFlashcardFinder,
  reset: resetMockUseFlashcardFinder,
} = createOverrideableMockHook<[], UseFlashcardFinderReturnType>(
  defaultMockUseFlashcardFinder,
);

export default mockUseFlashcardFinder;
