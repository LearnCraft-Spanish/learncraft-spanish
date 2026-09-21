import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { UseFlashcardManagerReturn } from '@application/useCases/useFlashcardManager/useFlashcardManager';
import type { FlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import type { SrsDifficulty } from '@domain/srs';
import type {
  CourseWithLessons,
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

/**
 * The default fixture mirrors a student who owns more flashcards than fit on a
 * page, so a consumer's pagination and its Spanglish menu item are both
 * exercised by the happy path rather than only by an override.
 */
const PAGE_SIZE = 25;
const OWNED_FLASHCARD_COUNT = 32;
const SPANGLISH_FLASHCARD_COUNT = 3;

/**
 * A flashcard's own id and the id of the example it wraps are different numbers
 * in production. The offset keeps them far enough apart that a consumer which
 * reads the wrong one fails instead of passing by coincidence.
 */
const FLASHCARD_ID_OFFSET = 9000;

const defaultFlashcards: Flashcard[] = createMockFlashcardList()(
  OWNED_FLASHCARD_COUNT,
).map((flashcard, index) => ({
  ...flashcard,
  id: FLASHCARD_ID_OFFSET + index + 1,
  example: {
    ...flashcard.example,
    id: index + 1,
    spanglish: index < SPANGLISH_FLASHCARD_COUNT,
  },
}));

const defaultDisplayFlashcards: Flashcard[] = defaultFlashcards.slice(
  0,
  PAGE_SIZE,
);

const defaultPaginationState: PaginationState = {
  totalItems: defaultFlashcards.length,
  pageNumber: 1,
  maxPageNumber: Math.ceil(defaultFlashcards.length / PAGE_SIZE),
  startIndex: 0,
  endIndex: defaultDisplayFlashcards.length,
  pageSize: PAGE_SIZE,
  isOnFirstPage: true,
  isOnLastPage: false,
  previousPage: vi.fn<() => void>(),
  nextPage: vi.fn<() => void>(),
  goToFirstPage: vi.fn<() => void>(),
  goToPage: vi.fn<(page: number) => void>(),
};

// Lesson ids are deliberately unlike their lesson numbers, and unlike the course
// id, so a consumer that reads one where it means the other fails loudly.
const defaultCourse: CourseWithLessons = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 201, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
    { id: 202, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
    { id: 208, lessonNumber: 8, courseName: 'LearnCraft Spanish' },
  ],
};

const defaultLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
  currentCourseName: defaultCourse.name,
};

const defaultCollectedExamples: ExampleWithVocabulary[] = defaultFlashcards.map(
  (flashcard) => flashcard.example,
);

const defaultCustomFlashcards: Flashcard[] = defaultFlashcards.slice(0, 2);

/**
 * The predicates answer from the same lists the fixture publishes. A blanket
 * `false` made "not in the collection" and "in a collection of 32" look
 * identical, so a consumer that never consulted them passed by coincidence.
 */
const collectedExampleIds = new Set(
  defaultFlashcards.map((flashcard) => flashcard.example.id),
);
const customExampleIds = new Set(
  defaultCustomFlashcards.map((flashcard) => flashcard.example.id),
);
const collectedFlashcardIds = new Set(
  defaultFlashcards.map((flashcard) => flashcard.id),
);
const flashcardsByExampleId = new Map(
  defaultFlashcards.map((flashcard) => [flashcard.example.id, flashcard]),
);

const defaultFlashcardsQuery: UseStudentFlashcardsReturn = {
  flashcards: defaultFlashcards,
  flashcardsDueForReview: defaultFlashcards.slice(0, 4),
  // Distinct slices: a consumer that reads the whole custom set where it means
  // the due subset cannot pass on an identical list.
  customFlashcards: defaultCustomFlashcards,
  customFlashcardsDueForReview: defaultFlashcards.slice(0, 1),
  audioFlashcards: defaultFlashcards.slice(0, 8),
  collectedExamples: defaultCollectedExamples,
  isLoading: false,
  error: null,
  updateFlashcardInterval: vi.fn<
    (exampleId: number, difficulty: SrsDifficulty) => Promise<number>
  >(async () => 1),
  getRandomFlashcards: vi.fn<() => Flashcard[]>(() => []),
  isFlashcardCollected: vi.fn<(params: { flashcardId: number }) => boolean>(
    ({ flashcardId }) => collectedFlashcardIds.has(flashcardId),
  ),
  isExampleCollected: vi.fn<(params: { exampleId: number }) => boolean>(
    ({ exampleId }) => collectedExampleIds.has(exampleId),
  ),
  // Nothing is in flight on the happy path, so these two stay false; the
  // fixture publishes no pending set for them to disagree with.
  isAddingFlashcard: vi.fn<() => boolean>(() => false),
  isRemovingFlashcard: vi.fn<() => boolean>(() => false),
  isCustomFlashcard: vi.fn<(params: { exampleId: number }) => boolean>(
    ({ exampleId }) => customExampleIds.has(exampleId),
  ),
  isPendingFlashcard: vi.fn<() => boolean>(() => false),
  createFlashcards: vi.fn<
    (examples: ExampleWithVocabulary[]) => Promise<Flashcard[]>
  >(async () => []),
  deleteFlashcards: vi.fn<(exampleIds: number[]) => Promise<number>>(
    async (exampleIds) => exampleIds.length,
  ),
  updateFlashcards: vi.fn<() => Promise<Flashcard[]>>(async () => []),
  getFlashcardByExampleId: vi.fn<
    (params: { exampleId: number }) => Flashcard | undefined
  >(({ exampleId }) => flashcardsByExampleId.get(exampleId)),
};

const defaultReviewSchedules = new Map<number, FlashcardReviewDates>(
  defaultFlashcards.map((flashcard) => [
    flashcard.example.id,
    {
      addedOn: flashcard.dateCreated,
      lastReviewed: flashcard.lastReviewed,
      nextReview: flashcard.nextReview,
    },
  ]),
);

const defaultSkillTagSearch: UseSkillTagSearchReturnType = {
  tagSearchTerm: '',
  tagSuggestions: [],
  updateTagSearchTerm:
    vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  removeTagFromSuggestions: vi.fn<(tagKey: string) => void>(),
  addTagBackToSuggestions: vi.fn<(tagKey: string) => void>(),
  isLoading: false,
  error: null,
};

const defaultExampleFilter: UseCombinedFiltersWithVocabularyReturnType = {
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
  filterStateWithoutLesson: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTagKeys: [],
    includeUnpublished: false,
  },
  filterStateWithVocabulary: {
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    requiredVocabulary: undefined,
    allowedVocabulary: [],
  },
  lessonRangeVocabRequired: undefined,
  lessonVocabKnown: [],
  batchUpdateFilterStateWithoutLesson:
    vi.fn<(filters: ExampleFilterStateWithoutLesson) => void>(),
  audioOnly: false,
  updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
  excludeSpanglish: false,
  updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
  includeUnpublished: false,
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  selectedSkillTags: [],
  outOfRangeSkillTagKeys: [],
  addSkillTagToFilters: vi.fn<(tagKey: string) => void>(),
  removeSkillTagFromFilters: vi.fn<(tagKey: string) => void>(),
  bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
  course: defaultCourse,
  courseId: defaultCourse.id,
  updateUserSelectedCourseId: vi.fn<(courseId: number) => void>(),
  fromLesson: defaultCourse.lessons[0] ?? null,
  fromLessonNumber: 1,
  updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  toLesson: defaultCourse.lessons[2] ?? null,
  toLessonNumber: 8,
  updateToLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  skillTagSearch: defaultSkillTagSearch,
  filterPreset: PreSetQuizPreset.None,
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
  coursesWithLessons: [defaultCourse],
  isAdmin: false,
  isLoading: false,
  error: null,
};

export const defaultMockUseFlashcardManager: UseFlashcardManagerReturn = {
  allFlashcards: defaultFlashcards,
  displayFlashcards: defaultDisplayFlashcards,
  paginationState: defaultPaginationState,
  filterOwnedFlashcards: false,
  setFilterOwnedFlashcards: vi.fn<(filterOwnedFlashcards: boolean) => void>(),
  onGoingToQuiz: vi.fn<() => void>(),
  exampleFilter: defaultExampleFilter,
  resetFilters: vi.fn<() => void>(),
  lessonPopup: defaultLessonPopup,
  flashcardsQuery: defaultFlashcardsQuery,
  getReviewSchedule: vi.fn<
    (exampleId: number) => FlashcardReviewDates | undefined
  >((exampleId) => defaultReviewSchedules.get(exampleId)),
  spanglishFlashcardCount: SPANGLISH_FLASHCARD_COUNT,
  deleteAllOwnedSpanglish: vi.fn<() => Promise<number>>(
    async () => SPANGLISH_FLASHCARD_COUNT,
  ),
  studentFlashcardsLoading: false,
  filteredFlashcardsLoading: false,
  dependenciesLoading: false,
  error: null,
};

export const {
  mock: mockUseFlashcardManager,
  override: overrideMockUseFlashcardManager,
  reset: resetMockUseFlashcardManager,
} = createOverrideableMockHook<
  [{ enableFilteringByDefault: boolean }],
  UseFlashcardManagerReturn
>(defaultMockUseFlashcardManager);

export default mockUseFlashcardManager;
