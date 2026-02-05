import { useOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 25;

export interface UseSearchByQuizResultsParams {
  courseCode: string;
  quizNumber: number | undefined;
  vocabularyComplete?: boolean;
}

export function useSearchByQuizResults({
  courseCode,
  quizNumber,
  vocabularyComplete,
}: UseSearchByQuizResultsParams) {
  const { getOfficialQuizExamples } = useOfficialQuizAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'examples',
      'by quiz',
      courseCode,
      quizNumber,
      vocabularyComplete,
    ],
    queryFn: () =>
      getOfficialQuizExamples({
        courseCode,
        quizNumber: quizNumber!,
        vocabularyComplete,
      }),
    enabled: !!courseCode && !!quizNumber,
  });

  const paginationState = usePagination({
    itemsPerPage: PAGE_SIZE,
    totalItems: results?.length ?? 0,
  });

  const paginatedExamples = useMemo(() => {
    if (!results) return undefined;
    return results.slice(paginationState.startIndex, paginationState.endIndex);
  }, [results, paginationState.startIndex, paginationState.endIndex]);

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
