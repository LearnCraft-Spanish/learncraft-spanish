import type { UseCoursesWithLessonsReturn } from '@application/queries/useCoursesWithLessons';
import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { UseFilterOwnedFlashcardsReturn } from '@application/units/Filtering/useFilterOwnedFlashcards';
import type {
  LessonPopup,
  UseLessonPopupReturnType,
} from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type {
  CourseWithLessons,
  Flashcard,
  Lesson,
} from '@learncraft-spanish/shared';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { mockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import useFlashcardManager from '@application/useCases/useFlashcardManager';
import { defaultMockUseFlashcardManager } from '@application/useCases/useFlashcardManager/useFlashcardManager.mock';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Assigned in beforeEach; the mock factories below read them lazily at render time.
let filterOwnedFlashcardsReturn: UseFilterOwnedFlashcardsReturn;
let lessonPopupValue: LessonPopup;
let publishedCoursesValue: UseCoursesWithLessonsReturn;
const filterOwnedFlashcardsArgs: boolean[] = [];

vi.mock('@application/units/Filtering/useFilterOwnedFlashcards', () => ({
  useFilterOwnedFlashcards: vi.fn<
    (filterOwnedFlashcards: boolean) => UseFilterOwnedFlashcardsReturn
  >((filterOwnedFlashcards) => {
    filterOwnedFlashcardsArgs.push(filterOwnedFlashcards);
    return filterOwnedFlashcardsReturn;
  }),
}));

vi.mock('@application/units/useLessonPopup', () => ({
  default: vi.fn<() => UseLessonPopupReturnType>(() => ({
    lessonPopup: lessonPopupValue,
  })),
}));

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: vi.fn<
    (includeUnpublished?: boolean) => UseCoursesWithLessonsReturn
  >(() => publishedCoursesValue),
}));

// Lesson ids are deliberately unlike their lesson numbers, and unlike the
// course id, so an assertion on one cannot be satisfied by the other.
const learncraftCourse: CourseWithLessons = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 21, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
    { id: 22, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
  ],
};

const essentialCourse: CourseWithLessons = {
  id: 3,
  name: 'Essential Spanish',
  published: true,
  lessons: [{ id: 30, lessonNumber: 1, courseName: 'Essential Spanish' }],
};

const unpublishedLesson: Lesson = {
  id: 99,
  lessonNumber: 9,
  courseName: 'Unreleased Course',
};

/**
 * A flashcard's own id and the id of the example it wraps are different numbers
 * in production. The fixture offsets the flashcard id far enough that no
 * arithmetic coincidence can line the two up, so a lookup keyed by the wrong one
 * fails instead of passing by accident.
 */
const FLASHCARD_ID_OFFSET = 9000;

const createFlashcard = (exampleId: number, spanglish = false): Flashcard => {
  const flashcard = createMockFlashcard({
    id: FLASHCARD_ID_OFFSET + exampleId,
  });
  return {
    ...flashcard,
    example: { ...flashcard.example, id: exampleId, spanglish },
  };
};

const createFlashcards = (count: number): Flashcard[] =>
  Array.from({ length: count }, (_, index) => createFlashcard(index + 1));

const createFlashcardsQuery = (
  overrides: Partial<UseStudentFlashcardsReturn> = {},
): UseStudentFlashcardsReturn => ({
  ...mockUseStudentFlashcards,
  ...overrides,
});

const createExampleFilter = (
  course: CourseWithLessons | null,
): UseCombinedFiltersWithVocabularyReturnType => ({
  ...defaultMockUseFlashcardManager.exampleFilter,
  course,
  courseId: course?.id ?? null,
  bulkUpdateSkillTagKeys: vi.fn<(skillTagKeys: string[]) => void>(),
  updateExcludeSpanglish: vi.fn<(excludeSpanglish: boolean) => void>(),
  updateAudioOnly: vi.fn<(audioOnly: boolean) => void>(),
  updateIncludeUnpublished: vi.fn<(includeUnpublished: boolean) => void>(),
  setFilterPreset: vi.fn<(preset: PreSetQuizPreset) => void>(),
  updateFromLessonNumber: vi.fn<(lessonNumber: number) => void>(),
  skillTagSearch: {
    ...defaultMockUseFlashcardManager.exampleFilter.skillTagSearch,
    updateTagSearchTerm:
      vi.fn<(target?: EventTarget & HTMLInputElement) => void>(),
  },
});

const createFilterOwnedFlashcardsReturn = (
  overrides: Partial<UseFilterOwnedFlashcardsReturn> = {},
): UseFilterOwnedFlashcardsReturn => ({
  filteredFlashcards: [],
  combinedFilters: createExampleFilter(null),
  flashcardsQuery: createFlashcardsQuery(),
  studentFlashcardsLoading: false,
  filteredFlashcardsLoading: false,
  error: null,
  ...overrides,
});

const renderManager = (enableFilteringByDefault = false) =>
  renderHook(() => useFlashcardManager({ enableFilteringByDefault }));

/**
 * Re-renders with a new `enableFilteringByDefault`, which is what the page does
 * once the router has stripped `?enableFiltering=true` from the URL.
 */
const renderManagerWithProp = (enableFilteringByDefault: boolean) =>
  renderHook(
    (props: { enableFilteringByDefault: boolean }) =>
      useFlashcardManager(props),
    { initialProps: { enableFilteringByDefault } },
  );

describe('useFlashcardManager', () => {
  beforeEach(() => {
    filterOwnedFlashcardsArgs.length = 0;
    filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn();
    lessonPopupValue = { lessonsByVocabulary: [], lessonsLoading: false };
    publishedCoursesValue = {
      data: [learncraftCourse, essentialCourse],
      isLoading: false,
      error: null,
    };
  });

  describe('pagination', () => {
    it('paginates the filtered list 25 at a time and keeps allFlashcards whole', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: createFlashcards(30),
      });

      const { result } = renderManager();

      expect(result.current.paginationState.pageSize).toBe(25);
      expect(result.current.paginationState.maxPageNumber).toBe(2);
      expect(result.current.allFlashcards).toHaveLength(30);
      expect(result.current.displayFlashcards).toHaveLength(25);
      expect(result.current.displayFlashcards[0]?.example.id).toBe(1);
    });

    it('slices the second page from where the first page ended', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: createFlashcards(30),
      });

      const { result } = renderManager();

      act(() => {
        result.current.paginationState.nextPage();
      });

      expect(result.current.paginationState.pageNumber).toBe(2);
      expect(result.current.displayFlashcards).toHaveLength(5);
      expect(result.current.displayFlashcards[0]?.example.id).toBe(26);
    });

    it('clamps back to the first page when the filtered list shrinks', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: createFlashcards(30),
      });

      const { result, rerender } = renderManager();

      act(() => {
        result.current.paginationState.nextPage();
      });

      expect(result.current.paginationState.pageNumber).toBe(2);

      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: createFlashcards(5),
      });
      rerender();

      expect(result.current.paginationState.pageNumber).toBe(1);
      expect(result.current.displayFlashcards).toHaveLength(5);
      expect(result.current.displayFlashcards[0]?.example.id).toBe(1);
    });
  });

  describe('filter toggle', () => {
    it('seeds filterOwnedFlashcards from enableFilteringByDefault', () => {
      const { result } = renderManager(true);

      expect(result.current.filterOwnedFlashcards).toBe(true);
      expect(filterOwnedFlashcardsArgs[0]).toBe(true);
    });

    it('defaults filterOwnedFlashcards to false', () => {
      const { result } = renderManager();

      expect(result.current.filterOwnedFlashcards).toBe(false);
      expect(filterOwnedFlashcardsArgs[0]).toBe(false);
    });

    it('keeps filtering on after the url parameter is stripped', () => {
      const { result, rerender } = renderManagerWithProp(true);

      expect(result.current.filterOwnedFlashcards).toBe(true);

      // The page strips `?enableFiltering=true` on mount, so the prop goes back
      // to false on the next render. Filtering must not follow it.
      rerender({ enableFilteringByDefault: false });

      expect(result.current.filterOwnedFlashcards).toBe(true);
      expect(filterOwnedFlashcardsArgs.at(-1)).toBe(true);
    });

    it('leaves filtering off when the parameter was never present', () => {
      const { result, rerender } = renderManagerWithProp(false);

      rerender({ enableFilteringByDefault: false });

      expect(result.current.filterOwnedFlashcards).toBe(false);
      expect(filterOwnedFlashcardsArgs.at(-1)).toBe(false);
    });

    it('setFilterOwnedFlashcards drives the client-side filter', () => {
      const { result } = renderManager();

      act(() => {
        result.current.setFilterOwnedFlashcards(true);
      });

      expect(result.current.filterOwnedFlashcards).toBe(true);
      expect(filterOwnedFlashcardsArgs.at(-1)).toBe(true);
    });

    it('onGoingToQuiz turns filtering on', () => {
      const { result } = renderManager();

      act(() => {
        result.current.onGoingToQuiz();
      });

      expect(result.current.filterOwnedFlashcards).toBe(true);
    });
  });

  describe('loading and error states', () => {
    it('reports filteredFlashcardsLoading only while filtering is on', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcardsLoading: true,
      });

      const { result } = renderManager();

      expect(result.current.filteredFlashcardsLoading).toBe(false);

      act(() => {
        result.current.setFilterOwnedFlashcards(true);
      });

      expect(result.current.filteredFlashcardsLoading).toBe(true);
    });

    it('passes studentFlashcardsLoading through untouched', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        studentFlashcardsLoading: true,
      });

      const { result } = renderManager();

      expect(result.current.studentFlashcardsLoading).toBe(true);
    });

    it('is dependenciesLoading while the active student loads', () => {
      overrideMockActiveStudent({ isLoading: true });

      const { result } = renderManager();

      expect(result.current.dependenciesLoading).toBe(true);
    });

    it('is dependenciesLoading while auth loads', () => {
      overrideMockAuthAdapter({ isLoading: true });

      const { result } = renderManager();

      expect(result.current.dependenciesLoading).toBe(true);
    });

    it('is not dependenciesLoading once both are settled', () => {
      const { result } = renderManager();

      expect(result.current.dependenciesLoading).toBe(false);
    });

    it('passes the filter error through', () => {
      const error = new Error('failed to filter owned flashcards');
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        error,
      });

      const { result } = renderManager();

      expect(result.current.error).toBe(error);
    });
  });

  describe('lesson popup', () => {
    it('drops unpublished lessons and lists the selected course first', () => {
      lessonPopupValue = {
        lessonsByVocabulary: [
          essentialCourse.lessons[0]!,
          unpublishedLesson,
          learncraftCourse.lessons[1]!,
          learncraftCourse.lessons[0]!,
        ],
        lessonsLoading: false,
      };
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        combinedFilters: createExampleFilter(learncraftCourse),
      });

      const { result } = renderManager();

      expect(
        result.current.lessonPopup.lessonsByVocabulary.map(
          (lesson) => lesson.id,
        ),
      ).toEqual([21, 22, 30]);
      expect(result.current.lessonPopup.currentCourseName).toBe(
        'LearnCraft Spanish',
      );
    });

    it('has no current course name when no course is selected', () => {
      lessonPopupValue = {
        lessonsByVocabulary: [
          essentialCourse.lessons[0]!,
          learncraftCourse.lessons[0]!,
        ],
        lessonsLoading: false,
      };

      const { result } = renderManager();

      expect(result.current.lessonPopup.currentCourseName).toBeNull();
      expect(
        result.current.lessonPopup.lessonsByVocabulary.map(
          (lesson) => lesson.id,
        ),
      ).toEqual([30, 21]);
    });

    it('is loading while the vocabulary lessons load', () => {
      lessonPopupValue = { lessonsByVocabulary: [], lessonsLoading: true };

      const { result } = renderManager();

      expect(result.current.lessonPopup.lessonsLoading).toBe(true);
    });

    it('is loading while the published courses load', () => {
      lessonPopupValue = {
        lessonsByVocabulary: [learncraftCourse.lessons[0]!],
        lessonsLoading: false,
      };
      publishedCoursesValue = { data: undefined, isLoading: true, error: null };

      const { result } = renderManager();

      expect(result.current.lessonPopup.lessonsLoading).toBe(true);
      expect(result.current.lessonPopup.lessonsByVocabulary).toEqual([]);
    });
  });

  describe('passthrough for the presentational sections', () => {
    it('exposes the combined filters instance the client-side filter already owns', () => {
      const { result } = renderManager();

      expect(result.current.exampleFilter).toBe(
        filterOwnedFlashcardsReturn.combinedFilters,
      );
    });

    it('exposes the flashcards query instance the client-side filter already owns', () => {
      const { result } = renderManager();

      expect(result.current.flashcardsQuery).toBe(
        filterOwnedFlashcardsReturn.flashcardsQuery,
      );
    });
  });

  describe('resetFilters', () => {
    it('clears tags, toggles, preset and tag search', () => {
      const exampleFilter = createExampleFilter(null);
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        combinedFilters: exampleFilter,
      });

      const { result } = renderManager();

      act(() => {
        result.current.resetFilters();
      });

      expect(exampleFilter.bulkUpdateSkillTagKeys).toHaveBeenCalledWith([]);
      expect(exampleFilter.updateExcludeSpanglish).toHaveBeenCalledWith(false);
      expect(exampleFilter.updateAudioOnly).toHaveBeenCalledWith(false);
      expect(exampleFilter.updateIncludeUnpublished).toHaveBeenCalledWith(
        false,
      );
      expect(exampleFilter.setFilterPreset).toHaveBeenCalledWith(
        PreSetQuizPreset.None,
      );
      expect(
        exampleFilter.skillTagSearch.updateTagSearchTerm,
      ).toHaveBeenCalled();
      expect(exampleFilter.updateFromLessonNumber).not.toHaveBeenCalled();
    });

    it('selects the virtual prerequisite lesson for a course that has prerequisites', () => {
      const exampleFilter = createExampleFilter({
        id: 7,
        name: 'Post-Podcast Lessons',
        published: true,
        lessons: [
          { id: 1, lessonNumber: 4, courseName: 'Post-Podcast Lessons' },
        ],
      });
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        combinedFilters: exampleFilter,
      });

      const { result } = renderManager();

      act(() => {
        result.current.resetFilters();
      });

      expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(-7001);
    });

    it('selects the first lesson for a course without prerequisites', () => {
      const exampleFilter = createExampleFilter({
        id: 2,
        name: 'LearnCraft Spanish',
        published: true,
        lessons: [
          { id: 71, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
          { id: 79, lessonNumber: 10, courseName: 'LearnCraft Spanish' },
        ],
      });
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        combinedFilters: exampleFilter,
      });

      const { result } = renderManager();

      act(() => {
        result.current.resetFilters();
      });

      expect(exampleFilter.updateFromLessonNumber).toHaveBeenCalledWith(3);
    });

    it('leaves the lesson range alone when the course has no lessons', () => {
      const exampleFilter = createExampleFilter({
        id: 2,
        name: 'LearnCraft Spanish',
        published: true,
        lessons: [],
      });
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        combinedFilters: exampleFilter,
      });

      const { result } = renderManager();

      act(() => {
        result.current.resetFilters();
      });

      expect(exampleFilter.updateFromLessonNumber).not.toHaveBeenCalled();
    });
  });

  describe('review schedule lookup', () => {
    it('returns the review dates of an owned flashcard by example id', () => {
      const flashcard = createFlashcard(7);
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [flashcard],
      });

      const { result } = renderManager();

      expect(result.current.getReviewSchedule(7)).toEqual({
        addedOn: flashcard.dateCreated,
        lastReviewed: flashcard.lastReviewed,
        nextReview: flashcard.nextReview,
      });
    });

    /**
     * The expand panel only ever has the example id to hand. Keying the lookup
     * by the flashcard's own id instead would blank every row's review schedule
     * in production, which is the v1 regression this guards.
     */
    it('is not keyed by the flashcard id', () => {
      const flashcard = createFlashcard(7);
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [flashcard],
      });

      const { result } = renderManager();

      expect(flashcard.id).not.toBe(flashcard.example.id);
      expect(result.current.getReviewSchedule(flashcard.id)).toBeUndefined();
      expect(
        result.current.getReviewSchedule(flashcard.example.id),
      ).toBeDefined();
    });

    it('returns nothing for an example that is not in the filtered list', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [createFlashcard(7)],
      });

      const { result } = renderManager();

      expect(result.current.getReviewSchedule(9999)).toBeUndefined();
    });

    it('keeps one lookup identity while the filtered list is unchanged', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: createFlashcards(3),
      });

      const { result, rerender } = renderManager();
      const first = result.current.getReviewSchedule;

      rerender();

      expect(result.current.getReviewSchedule).toBe(first);
    });

    it('follows the filtered list when it changes', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [createFlashcard(1), createFlashcard(2)],
      });

      const { result, rerender } = renderManager();

      expect(result.current.getReviewSchedule(2)).toBeDefined();

      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [createFlashcard(1)],
      });
      rerender();

      expect(result.current.getReviewSchedule(2)).toBeUndefined();
    });
  });

  describe('owned spanglish bulk delete', () => {
    it('counts every owned spanglish flashcard, ignoring the active filter', () => {
      const ownedFlashcards = [
        createFlashcard(1, true),
        createFlashcard(2, false),
        createFlashcard(3, true),
      ];
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        filteredFlashcards: [ownedFlashcards[1]!],
        flashcardsQuery: createFlashcardsQuery({
          flashcards: ownedFlashcards,
        }),
      });

      const { result } = renderManager(true);

      expect(result.current.filterOwnedFlashcards).toBe(true);
      expect(result.current.allFlashcards).toHaveLength(1);
      expect(result.current.spanglishFlashcardCount).toBe(2);
    });

    it('deletes every owned spanglish flashcard by example id', async () => {
      const deleteFlashcards = vi.fn<(exampleIds: number[]) => Promise<number>>(
        async (exampleIds) => exampleIds.length,
      );
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        flashcardsQuery: createFlashcardsQuery({
          flashcards: [
            createFlashcard(1, true),
            createFlashcard(2, false),
            createFlashcard(3, true),
          ],
          deleteFlashcards,
        }),
      });

      const { result } = renderManager();

      let deletedCount = 0;
      await act(async () => {
        deletedCount = await result.current.deleteAllOwnedSpanglish();
      });

      expect(deleteFlashcards).toHaveBeenCalledWith([1, 3]);
      expect(deletedCount).toBe(2);
    });

    it('does not call the mutation when there is nothing to delete', async () => {
      const deleteFlashcards = vi.fn<(exampleIds: number[]) => Promise<number>>(
        async (exampleIds) => exampleIds.length,
      );
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        flashcardsQuery: createFlashcardsQuery({
          flashcards: [createFlashcard(1, false)],
          deleteFlashcards,
        }),
      });

      const { result } = renderManager();

      let deletedCount = -1;
      await act(async () => {
        deletedCount = await result.current.deleteAllOwnedSpanglish();
      });

      expect(result.current.spanglishFlashcardCount).toBe(0);
      expect(deleteFlashcards).not.toHaveBeenCalled();
      expect(deletedCount).toBe(0);
    });

    it('counts zero when the flashcards have not loaded yet', () => {
      filterOwnedFlashcardsReturn = createFilterOwnedFlashcardsReturn({
        flashcardsQuery: createFlashcardsQuery({ flashcards: undefined }),
      });

      const { result } = renderManager();

      expect(result.current.spanglishFlashcardCount).toBe(0);
    });
  });
});
