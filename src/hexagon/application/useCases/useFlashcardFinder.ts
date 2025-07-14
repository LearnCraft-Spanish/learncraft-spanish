import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseExampleQueryReturnType } from '../queries/useExampleQuery';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
import { useMemo, useState } from 'react';
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
    page,
    changePage: changeQueryPage,
  } = useExampleQuery(queryPageSize);
  const [selectedPage, setSelectedPage] = useState(1);
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  // // Slice the data for display
  const displayData = useMemo(() => {
    const startIndex = (selectedPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredExamples ?? [];
  }, [filteredExamples, selectedPage, pageSize]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setSelectedPage(newPage);

    // Check if we need to fetch a new query page
    const currentQueryPage = Math.floor((newPage - 1) / 4) + 1;
    if (currentQueryPage !== page) {
      changeQueryPage(currentQueryPage);
    }
  };

  const exampleQuery: UseExampleQueryReturnType = {
    filteredExamples: displayData,
    isLoading,
    error,
    totalCount,
    page,
    pageSize,
    changePage: handlePageChange,
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
