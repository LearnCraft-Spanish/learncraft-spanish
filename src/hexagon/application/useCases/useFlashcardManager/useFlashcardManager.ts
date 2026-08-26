import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { FlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useFilterOwnedFlashcards } from '@application/units/Filtering/useFilterOwnedFlashcards';
import { usePagination } from '@application/units/Pagination/usePagination';
import useLessonPopup from '@application/units/useLessonPopup';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { filterPublishedLessons } from '@domain/functions/filterPublishedLessons';
import { sortLessonsByCurrentCourse } from '@domain/functions/sortLessonsByCurrentCourse';
import { useCallback, useMemo, useState } from 'react';

export interface UseFlashcardManagerReturn {
  /** The full filtered list, not just the current page. Feeds copy-whole-table. */
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;

  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  onGoingToQuiz: () => void;

  /**
   * The same coordinator-backed combined filters the Finder exposes, reusing the
   * subscription `useFilterOwnedFlashcards` already owns so the v2 filter
   * section can be presentational without a competing filter source.
   */
  exampleFilter: UseCombinedFiltersWithVocabularyReturnType;
  resetFilters: () => void;
  /**
   * Built the same way the Finder builds it: published-lesson filtering,
   * current-course-first ordering, and the selected course name the shared
   * expand panel highlights. Enriching here keeps the two surfaces' rows
   * identical instead of leaving the Manager on the raw popup.
   */
  lessonPopup: LessonPopup;
  flashcardsQuery: UseStudentFlashcardsReturn;

  /**
   * Review dates for the expand panel, by example id. Map-backed so a page of
   * rows costs one lookup each instead of a scan of the whole collection, and
   * so the `Flashcard` -> `FlashcardReviewDates` shaping stays out of the page.
   */
  getReviewSchedule: (exampleId: number) => FlashcardReviewDates | undefined;

  /**
   * Owned-spanglish bulk delete. The count and the mutation live here so the v2
   * options menu can own only the confirm modal and the empty-state toast,
   * instead of calling application hooks from a leaf. The count covers every
   * owned flashcard rather than the current filter or page, matching v1.
   * `deleteAllOwnedSpanglish` resolves to the number deleted and no-ops when
   * there is nothing to delete.
   */
  spanglishFlashcardCount: number;
  deleteAllOwnedSpanglish: () => Promise<number>;

  studentFlashcardsLoading: boolean;
  filteredFlashcardsLoading: boolean;
  dependenciesLoading: boolean;
  error: Error | null;
}

export default function useFlashcardManager({
  enableFilteringByDefault,
}: {
  enableFilteringByDefault: boolean;
}): UseFlashcardManagerReturn {
  const { isLoading: activeStudentLoading } = useActiveStudent();
  const { isLoading: authLoading } = useAuthAdapter();

  // Arbitrary definition
  const PAGE_SIZE = 25;

  // Local state for filtering owned flashcards
  const [filterOwnedFlashcards, setFilterOwnedFlashcards] = useState(
    enableFilteringByDefault,
  );

  // This is the principal hook for this use case
  const {
    filteredFlashcards,
    combinedFilters,
    flashcardsQuery,
    studentFlashcardsLoading,
    filteredFlashcardsLoading,
    error,
  } = useFilterOwnedFlashcards(filterOwnedFlashcards);

  const exampleFilter: UseCombinedFiltersWithVocabularyReturnType =
    combinedFilters;
  const { flashcards, deleteFlashcards } = flashcardsQuery;

  // We use this to paginate the flashcards
  const paginationState = usePagination({
    itemsPerPage: PAGE_SIZE,
    totalItems: filteredFlashcards.length,
  });
  // We display only the flashcards that are in the current page
  const displayFlashcards = useMemo(() => {
    return filteredFlashcards.slice(
      paginationState.startIndex,
      paginationState.endIndex,
    );
  }, [filteredFlashcards, paginationState]);

  const onGoingToQuiz = useCallback(() => {
    setFilterOwnedFlashcards(true);
  }, []);

  // For the vocabulary popover in an expanded row
  const { lessonPopup: fetchedLessonPopup } = useLessonPopup();
  const { data: publishedCourses, isLoading: publishedCoursesLoading } =
    useCoursesWithLessons(false);

  const currentCourseName = exampleFilter.course?.name ?? null;
  const lessonPopup = useMemo((): LessonPopup => {
    return {
      lessonsByVocabulary: sortLessonsByCurrentCourse(
        filterPublishedLessons(
          fetchedLessonPopup.lessonsByVocabulary,
          publishedCourses ?? [],
        ),
        currentCourseName,
      ),
      lessonsLoading:
        fetchedLessonPopup.lessonsLoading || publishedCoursesLoading,
      currentCourseName,
    };
  }, [
    currentCourseName,
    fetchedLessonPopup.lessonsByVocabulary,
    fetchedLessonPopup.lessonsLoading,
    publishedCourses,
    publishedCoursesLoading,
  ]);

  const resetFilters = useCallback((): void => {
    exampleFilter.bulkUpdateSkillTagKeys([]);
    exampleFilter.updateExcludeSpanglish(false);
    exampleFilter.updateAudioOnly(false);
    exampleFilter.updateIncludeUnpublished(false);
    exampleFilter.setFilterPreset(PreSetQuizPreset.None);
    exampleFilter.skillTagSearch.updateTagSearchTerm();

    const selectedCourse = exampleFilter.course;
    if (!selectedCourse) {
      return;
    }

    const prerequisites = getPrerequisitesForCourse(selectedCourse.id);
    if (prerequisites && prerequisites.prerequisites.length > 0) {
      exampleFilter.updateFromLessonNumber(
        generateVirtualLessonId(selectedCourse.id, 0),
      );
      return;
    }

    const firstLesson = selectedCourse.lessons[0];
    if (firstLesson) {
      exampleFilter.updateFromLessonNumber(firstLesson.lessonNumber);
    }
  }, [exampleFilter]);

  const reviewSchedules = useMemo(() => {
    return new Map<number, FlashcardReviewDates>(
      filteredFlashcards.map((flashcard) => [
        flashcard.example.id,
        {
          addedOn: flashcard.dateCreated,
          lastReviewed: flashcard.lastReviewed,
          nextReview: flashcard.nextReview,
        },
      ]),
    );
  }, [filteredFlashcards]);

  const getReviewSchedule = useCallback(
    (exampleId: number): FlashcardReviewDates | undefined => {
      return reviewSchedules.get(exampleId);
    },
    [reviewSchedules],
  );

  const spanglishFlashcards = useMemo(() => {
    return flashcards?.filter((flashcard) => flashcard.example.spanglish) ?? [];
  }, [flashcards]);

  const deleteAllOwnedSpanglish = useCallback(async (): Promise<number> => {
    if (spanglishFlashcards.length === 0) {
      return 0;
    }
    return deleteFlashcards(
      spanglishFlashcards.map((flashcard) => flashcard.example.id),
    );
  }, [deleteFlashcards, spanglishFlashcards]);

  return {
    allFlashcards: filteredFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    onGoingToQuiz,
    exampleFilter,
    resetFilters,
    lessonPopup,
    flashcardsQuery,
    getReviewSchedule,
    spanglishFlashcardCount: spanglishFlashcards.length,
    deleteAllOwnedSpanglish,
    studentFlashcardsLoading,
    filteredFlashcardsLoading:
      filteredFlashcardsLoading && filterOwnedFlashcards,
    dependenciesLoading: activeStudentLoading || authLoading,
    error,
  };
}
