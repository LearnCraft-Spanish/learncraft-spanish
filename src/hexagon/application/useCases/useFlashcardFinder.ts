import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseExampleQueryReturnType } from '../queries/useExampleQuery';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useCallback, useMemo, useState } from 'react';
import { useExampleQuery } from '../queries/useExampleQuery';

export interface UseFlashcardFinderReturnType {
  exampleFilter: UseExampleFilterReturnType;
  exampleQuery: UseExampleQueryReturnType;
  flashcardsQuery: UseStudentFlashcardsReturnType;
  totalPages: number | null;
  pageSize: number;
}

export default function useFlashcardFinder(): UseFlashcardFinderReturnType {
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const queryPageSize = 100;
  const pageSize = 25;
  const {
    filteredExamples,
    isLoading,
    error,
    totalCount,
    page: queryPage,
    changePage: changeQueryPage,
    prefetchNextBatch,
  } = useExampleQuery(queryPageSize);
  const [currentDisplayPage, setCurrentDisplayPage] = useState(1);
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  /*
  // Calculate which examples to show based on current display page
  const getExamplesForCurrentPage = useMemo(() => {
    if (!filteredExamples) return [];

    // Calculate which batch we're in and which examples to show
    const examplesPerQueryPage = 100;
    const examplesPerDisplayPage = 25;

    // Calculate which query page we need for the current display page
    const totalExamplesNeeded = currentDisplayPage * examplesPerDisplayPage;
    const requiredQueryPage = Math.ceil(
      totalExamplesNeeded / examplesPerQueryPage,
    );

    // If we need a different query page, return empty array (will trigger fetch)
    if (requiredQueryPage !== queryPage) {
      return [];
    }

    // Calculate the start index within the current batch
    const batchStart = (requiredQueryPage - 1) * examplesPerQueryPage;
    const startIndex =
      (currentDisplayPage - 1) * examplesPerDisplayPage - batchStart;
    const endIndex = startIndex + examplesPerDisplayPage;

    return filteredExamples.slice(startIndex, endIndex);
  }, [filteredExamples, currentDisplayPage, queryPage]);
*/
  // Handle page changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentDisplayPage(newPage);

      // Calculate which query page we need
      const examplesPerQueryPage = 100;
      const examplesPerDisplayPage = 25;
      const totalExamplesNeeded = newPage * examplesPerDisplayPage;
      const requiredQueryPage = Math.ceil(
        totalExamplesNeeded / examplesPerQueryPage,
      );

      // If we need a new query page, fetch it
      if (requiredQueryPage !== queryPage) {
        changeQueryPage(requiredQueryPage);
      }

      // Prefetch next batch if we're approaching the end
      const currentBatchStart = (queryPage - 1) * examplesPerQueryPage;
      const currentBatchEnd = currentBatchStart + examplesPerQueryPage;
      const examplesNeededForPage = newPage * examplesPerDisplayPage;

      if (examplesNeededForPage >= currentBatchEnd * 0.75) {
        prefetchNextBatch();
      }
    },
    [currentDisplayPage, queryPage, changeQueryPage, prefetchNextBatch],
  );

  const exampleQuery: UseExampleQueryReturnType = {
    // filteredExamples: getExamplesForCurrentPage,
    filteredExamples: filteredExamples ?? [], // fix this
    isLoading,
    error,
    totalCount,
    page: currentDisplayPage,
    pageSize,
    changePage: handlePageChange,
    prefetchNextBatch,
  };

  const flashcardsQuery: UseStudentFlashcardsReturnType =
    useStudentFlashcards();

  return {
    exampleFilter,
    exampleQuery,
    flashcardsQuery,
    totalPages,
    pageSize,
  };
}
