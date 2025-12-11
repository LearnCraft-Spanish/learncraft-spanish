import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 25;

export interface UseSearchByIdsResultsParams {
  ids: number[];
}

export function useSearchByIdsResults({ ids }: UseSearchByIdsResultsParams) {
  const { getExamplesByIds } = useExampleAdapter();
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['examples', 'by ids', ids],
    queryFn: () => getExamplesByIds(ids),
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
