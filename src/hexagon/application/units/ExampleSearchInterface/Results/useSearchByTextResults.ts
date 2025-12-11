import { useExampleAdapter } from '@application/adapters/exampleAdapter';
import useQueryPagination from '@application/units/Pagination/useQueryPagination';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

const PAGE_SIZE = 25;
const QUERY_PAGE_SIZE = 100;

export interface UseSearchByTextResultsParams {
  spanishString: string;
  englishString: string;
}

export function useSearchByTextResults({
  spanishString,
  englishString,
}: UseSearchByTextResultsParams) {
  const [queryPage, setQueryPage] = useState(1);

  const changeQueryPage = useCallback((page: number) => {
    setQueryPage(page);
  }, []);

  const { searchExamplesByText } = useExampleAdapter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['examples', 'by text', spanishString, englishString, queryPage],
    queryFn: () =>
      searchExamplesByText(
        {
          spanishText: spanishString,
          englishText: englishString,
        },
        queryPage,
        QUERY_PAGE_SIZE,
      ),
  });

  const paginationState = useQueryPagination({
    queryPage,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: data?.totalCount,
    changeQueryPage,
  });

  // Calculate the examples for the current page
  const startIndex = paginationState.pageWithinQueryBatch * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedExamples = data?.examples.slice(startIndex, endIndex) ?? [];

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
