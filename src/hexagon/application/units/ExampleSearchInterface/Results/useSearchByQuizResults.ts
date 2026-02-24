import { useQuizAdapter } from '@application/adapters/quizAdapter';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 25;

export interface UseSearchByQuizResultsParams {
  quizId: number | undefined;
  vocabularyComplete?: boolean;
}

export function useSearchByQuizResults({
  quizId,
  vocabularyComplete,
}: UseSearchByQuizResultsParams) {
  const { getQuizExamples } = useQuizAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by quiz id', quizId, vocabularyComplete],
    queryFn: () => getQuizExamples({ quizId: quizId!, vocabularyComplete }),
    enabled: !!quizId,
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
