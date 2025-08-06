import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example/core-types';
import type { UseExampleQueryReturnType } from '../queries/useExampleQuery';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useExampleQuery } from '../queries/useExampleQuery';
import useQueryPagination from '../units/Pagination/useQueryPagination';

export interface UseFlashcardFinderReturnType {
  pagination: QueryPaginationState;
  exampleFilter: UseExampleFilterReturnType;
  exampleQuery: UseExampleQueryReturnType;
  displayExamples: ExampleWithVocabulary[];
  flashcardsQuery: UseStudentFlashcardsReturnType;
  totalPages: number | null;
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  const [filtersChanging, setFiltersChanging] = useState(false);
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();

  const QUERY_PAGE_SIZE = 150;
  const PAGE_SIZE = 25;

  const {
    updateAudioOnly: updateAudioOnlyFunction,
    updateExcludeSpanglish: updateExcludeSpanglishFunction,
    addSkillTagToFilters: addSkillTagToFiltersFunction,
    removeSkillTagFromFilters: removeSkillTagFromFiltersFunction,
  } = exampleFilter.filterState;

  const exampleQuery = useExampleQuery(QUERY_PAGE_SIZE, filtersChanging);

  const pagination: QueryPaginationState = useQueryPagination({
    queryPage: exampleQuery.page,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: exampleQuery.totalCount ?? undefined,
    changeQueryPage: exampleQuery.changeQueryPage,
  });

  const {
    updateFromLessonNumber: updateFromLessonNumberFunction,
    updateToLessonNumber: updateToLessonNumberFunction,
    updateUserSelectedCourseId: updateUserSelectedCourseIdFunction,
  } = exampleFilter.courseAndLessonState;

  const totalPages = exampleQuery.totalCount
    ? Math.ceil(exampleQuery.totalCount / PAGE_SIZE)
    : null;

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

  useEffect(() => {
    if (filtersChanging) {
      pagination.resetPagination();
    }
  }, [filtersChanging, pagination]);

  const flashcardsQuery: UseStudentFlashcardsReturnType =
    useStudentFlashcards();

  const updateAudioOnly = useCallback(
    (audioOnly: boolean) => {
      if (filtersChanging) {
        updateAudioOnlyFunction(audioOnly);
      }
    },
    [updateAudioOnlyFunction, filtersChanging],
  );

  const updateExcludeSpanglish = useCallback(
    (excludeSpanglish: boolean) => {
      if (filtersChanging) {
        updateExcludeSpanglishFunction(excludeSpanglish);
      }
    },
    [updateExcludeSpanglishFunction, filtersChanging],
  );

  const addSkillTagToFilters = useCallback(
    (tagKey: string) => {
      if (filtersChanging) {
        addSkillTagToFiltersFunction(tagKey);
      }
    },
    [addSkillTagToFiltersFunction, filtersChanging],
  );

  const removeSkillTagFromFilters = useCallback(
    (tagKey: string) => {
      if (filtersChanging) {
        removeSkillTagFromFiltersFunction(tagKey);
      }
    },
    [removeSkillTagFromFiltersFunction, filtersChanging],
  );

  const updateFromLessonNumber = useCallback(
    (lessonNumber: number) => {
      if (!filtersChanging) {
        return;
      }
      updateFromLessonNumberFunction(lessonNumber);
    },
    [updateFromLessonNumberFunction, filtersChanging],
  );

  const updateToLessonNumber = useCallback(
    (lessonNumber: number) => {
      if (!filtersChanging) {
        return;
      }
      updateToLessonNumberFunction(lessonNumber);
    },
    [updateToLessonNumberFunction, filtersChanging],
  );

  const updateUserSelectedCourseId = useCallback(
    (courseId: number) => {
      if (!filtersChanging) {
        return;
      }
      updateUserSelectedCourseIdFunction(courseId);
    },
    [updateUserSelectedCourseIdFunction, filtersChanging],
  );

  return {
    pagination,
    exampleFilter: {
      initialLoading: exampleFilter.initialLoading,
      skillTagSearch: exampleFilter.skillTagSearch,
      courseAndLessonState: {
        ...exampleFilter.courseAndLessonState,
        updateFromLessonNumber,
        updateToLessonNumber,
        updateUserSelectedCourseId,
      },
      filterState: {
        ...exampleFilter.filterState,
        updateAudioOnly,
        updateExcludeSpanglish,
        addSkillTagToFilters,
        removeSkillTagFromFilters,
      },
    },
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    totalPages,
    filtersChanging,
    setFiltersChanging,
  };
}
