import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseExampleQueryReturnType } from '../queries/useExampleQuery';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useCallback, useEffect, useState } from 'react';
import { useExampleQuery } from '../queries/useExampleQuery';

export interface UseFlashcardFinderReturnType {
  exampleFilter: UseExampleFilterReturnType;
  exampleQuery: UseExampleQueryReturnType;
  flashcardsQuery: UseStudentFlashcardsReturnType;
  totalPages: number | null;
  pageSize: number;
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
  currentDisplayPage: number;
  setCurrentDisplayPage: (currentDisplayPage: number) => void;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  const [filtersChanging, setFiltersChanging] = useState(false);
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const queryPageSize = 100;
  const pageSize = 25;

  const {
    updateAudioOnly: updateAudioOnlyFunction,
    updateExcludeSpanglish: updateExcludeSpanglishFunction,
    addSkillTagToFilters: addSkillTagToFiltersFunction,
    removeSkillTagFromFilters: removeSkillTagFromFiltersFunction,
  } = exampleFilter.filterState;

  const {
    updateFromLessonNumber: updateFromLessonNumberFunction,
    updateToLessonNumber: updateToLessonNumberFunction,
    updateUserSelectedCourseId: updateUserSelectedCourseIdFunction,
  } = exampleFilter.courseAndLessonState;
  // Calculate how many display pages fit into one query page
  const DISPLAY_PAGES_PER_QUERY = queryPageSize / pageSize; // 4 display pages per query
  const exampleQuery = useExampleQuery(queryPageSize, filtersChanging);

  const [currentDisplayPage, setCurrentDisplayPage] = useState(1);

  const totalPages = exampleQuery.totalCount
    ? Math.ceil(exampleQuery.totalCount / pageSize)
    : null;

  // Enable prefetching when we're near the end of a query page batch
  // This happens on the last two pages of each query batch to ensure smooth pagination
  useEffect(() => {
    const pageWithinQueryBatch = currentDisplayPage % DISPLAY_PAGES_PER_QUERY;
    const isNearEndOfQueryBatch =
      pageWithinQueryBatch === 0 ||
      pageWithinQueryBatch === DISPLAY_PAGES_PER_QUERY - 1;

    exampleQuery.setCanPrefetch(isNearEndOfQueryBatch);
  }, [currentDisplayPage, DISPLAY_PAGES_PER_QUERY, exampleQuery]);

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
    exampleFilter: {
      courseAndLessonState: {
        ...exampleFilter.courseAndLessonState,
        updateFromLessonNumber,
        updateToLessonNumber,
        updateUserSelectedCourseId,
      },
      filterState: {
        ...exampleFilter.filterState,
        updateExcludeSpanglish,
        updateAudioOnly,
        addSkillTagToFilters,
        removeSkillTagFromFilters,
      },
      skillTagSearch: exampleFilter.skillTagSearch,
      initialLoading: exampleFilter.initialLoading,
    },
    exampleQuery,
    flashcardsQuery,
    totalPages,
    pageSize,
    filtersChanging,
    setFiltersChanging,
    currentDisplayPage,
    setCurrentDisplayPage,
  };
}
