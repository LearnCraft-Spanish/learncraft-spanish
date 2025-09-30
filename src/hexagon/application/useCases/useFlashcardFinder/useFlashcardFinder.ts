import type { UseExampleQueryReturnType } from '@application/queries/useExampleQuery';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import type { UseSkillTagSearchReturnType } from '../../units/useSkillTagSearch';
import { useExampleQuery } from '@application/queries/useExampleQuery';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import useQueryPagination from '@application/units/Pagination/useQueryPagination';
import useLessonPopup from '@application/units/useLessonPopup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useEffect, useMemo, useRef } from 'react';
import { useSkillTagSearch } from '../../units/useSkillTagSearch';

export interface UseFlashcardFinderReturnType {
  pagination: QueryPaginationState;
  exampleFilter: UseCombinedFiltersReturnType;
  exampleQuery: UseExampleQueryReturnType;
  displayExamples: ExampleWithVocabulary[];
  flashcardsQuery: UseStudentFlashcardsReturn;
  totalPages: number | null;
  lessonPopup: LessonPopup;
  skillTagSearch: UseSkillTagSearchReturnType;

  // Loading states similar to FlashcardManager
  filteredExamplesLoading: boolean;
  initialLoading: boolean;
  error: Error | null;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  const { lessonPopup } = useLessonPopup();

  const QUERY_PAGE_SIZE = 150;
  const PAGE_SIZE = 25;

  const exampleQuery = useExampleQuery(QUERY_PAGE_SIZE);

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

  return {
    pagination,
    exampleFilter,
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    totalPages,
    lessonPopup,
    skillTagSearch,

    // Loading states similar to FlashcardManager
    initialLoading:
      flashcardsQuery.isLoading ||
      exampleFilter.isLoading ||
      skillTagSearch.isLoading,
    filteredExamplesLoading: exampleQuery.isLoading,
    error: flashcardsQuery.error || exampleFilter.error,
  };
}
