import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useExampleQuery } from '@application/queries/ExampleQueries/useExampleQuery';
import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import useLessonPopup from '@application/units/useLessonPopup';
import { useSkillTagSearch } from '@application/units/useSkillTagSearch';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { useEffect, useMemo, useRef } from 'react';

export interface UseFlashcardFinderReturnType {
  pagination: QueryPaginationState;
  exampleFilter: UseCombinedFiltersReturnType;
  exampleQuery: UseExampleQueryReturnType;
  displayExamples: ExampleWithVocabulary[];
  flashcardsQuery: UseStudentFlashcardsReturn;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  skillTagSearch: UseSkillTagSearchReturnType;
  resetFilters: () => void;
  /** Active student's name, passed through from auth / app user. */
  studentDisplayName: string | null;

  // Loading states similar to FlashcardManager
  filteredExamplesLoading: boolean;
  initialLoading: boolean;
  error: Error | null;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  // isCoach or isAdmin
  const { isCoach, isAdmin } = useAuthAdapter();
  const { appUser } = useActiveStudent();
  const { lessonPopup } = useLessonPopup();

  const QUERY_PAGE_SIZE = 150;
  const PAGE_SIZE = 25;

  const exampleQuery = useExampleQuery(
    QUERY_PAGE_SIZE,
    false,
    isCoach || isAdmin, // disable cache if isCoach or isAdmin
  );

  const pagination: QueryPaginationState = useQueryPagination({
    queryPage: exampleQuery.page,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: exampleQuery.totalCount ?? undefined,
    changeQueryPage: exampleQuery.changeQueryPage,
  });

  const totalPages = exampleQuery.totalCount
    ? Math.ceil(exampleQuery.totalCount / PAGE_SIZE)
    : null;

  const exampleFilter: UseCombinedFiltersReturnType = useCombinedFilters({});

  // Track previous filter state to detect actual changes
  const previousFilterState = useRef<string | null>(null);

  // Reset pagination when filter state changes
  useEffect(() => {
    const currentFilterState = JSON.stringify({
      selectedSkillTags: exampleFilter.selectedSkillTags,
      excludeSpanglish: exampleFilter.excludeSpanglish,
      audioOnly: exampleFilter.audioOnly,
      courseId: exampleFilter.courseId,
      fromLessonNumber: exampleFilter.fromLessonNumber,
      toLessonNumber: exampleFilter.toLessonNumber,
    });

    if (
      previousFilterState.current !== null &&
      previousFilterState.current !== currentFilterState
    ) {
      pagination.resetPagination();
    }

    previousFilterState.current = currentFilterState;
  }, [
    exampleFilter.selectedSkillTags,
    exampleFilter.excludeSpanglish,
    exampleFilter.audioOnly,
    exampleFilter.courseId,
    exampleFilter.fromLessonNumber,
    exampleFilter.toLessonNumber,
    pagination,
  ]);

  // Enable prefetching when we're near the end of a query page batch
  // This happens on the last page of each query batch to ensure smooth pagination
  useEffect(() => {
    const isNearEndOfQueryBatch =
      pagination.pageWithinQueryBatch >= pagination.pagesPerQuery / 2;

    exampleQuery.setCanPrefetch(isNearEndOfQueryBatch);
  }, [
    pagination.pageWithinQueryBatch,
    pagination.page,
    pagination.pagesPerQuery,
    exampleQuery,
  ]);

  const startIndex = pagination.pageWithinQueryBatch * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const displayExamples = useMemo(
    () =>
      exampleQuery.filteredExamples
        ? exampleQuery.filteredExamples.slice(startIndex, endIndex)
        : [],
    [exampleQuery.filteredExamples, startIndex, endIndex],
  );

  const flashcardsQuery: UseStudentFlashcardsReturn = useStudentFlashcards();

  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  const resetFilters = (): void => {
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
  };

  return {
    pagination,
    exampleFilter,
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    totalPages,
    lessonPopup,
    skillTagSearch,
    resetFilters,
    studentDisplayName: appUser?.name ?? null,

    // Loading states similar to FlashcardManager
    initialLoading:
      flashcardsQuery.isLoading ||
      exampleFilter.isLoading ||
      skillTagSearch.isLoading,
    filteredExamplesLoading: exampleQuery.isLoading,
    error: flashcardsQuery.error || exampleFilter.error,
  };
}
