import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { UseExampleQueryReturnType } from '../queries/useExampleQuery';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import useExampleFilter from '@application/units/useExampleFilter';
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
  const queryPageSize = 1000; // BAD HACK. skipping pagination for now, we'll fix this later
  const pageSize = 25;
  const {
    filteredExamples,
    isLoading,
    error,
    totalCount,
    page,
    changeQueryPage,
  } = useExampleQuery(queryPageSize);

  // const [currentDisplayPage, setCurrentDisplayPage] = useState(1);

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  const exampleQuery: UseExampleQueryReturnType = {
    // filteredExamples: getExamplesForCurrentPage,
    filteredExamples: filteredExamples ?? [], // fix this
    isLoading,
    error,
    totalCount,
    page,
    pageSize,
    changeQueryPage,
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
