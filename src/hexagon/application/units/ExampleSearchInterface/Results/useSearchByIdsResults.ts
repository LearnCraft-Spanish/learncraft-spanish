import { useExampleByIdsQuery } from '@application/queries/ExampleQueries/useExampleByIdsQuery';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useMemo } from 'react';

const PAGE_SIZE = 25;

export interface UseSearchByIdsResultsParams {
  ids: number[];
}

export function useSearchByIdsResults({ ids }: UseSearchByIdsResultsParams) {
  const { examples, isLoading, error } = useExampleByIdsQuery(ids);

  const paginationState = usePagination({
    itemsPerPage: PAGE_SIZE,
    totalItems: examples?.length ?? 0,
  });

  const paginatedExamples = useMemo(() => {
    if (!examples) return undefined;
    return examples.slice(paginationState.startIndex, paginationState.endIndex);
  }, [examples, paginationState.startIndex, paginationState.endIndex]);

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
