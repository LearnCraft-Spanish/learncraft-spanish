import { useExamplesByRecentlyModified } from '@application/queries/ExampleQueries/useExamplesByRecentlyModified';
import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import { useCallback, useState } from 'react';

const PAGE_SIZE = 25;
const QUERY_PAGE_SIZE = 100;

export function useSearchByDatePagination() {
  const [queryPage, setQueryPage] = useState(1);

  const changeQueryPage = useCallback((page: number) => {
    setQueryPage(page);
  }, []);

  const { examples, isLoading, error } = useExamplesByRecentlyModified(
    queryPage,
    QUERY_PAGE_SIZE,
  );

  const paginationState = useQueryPagination({
    queryPage,
    pageSize: PAGE_SIZE,
    queryPageSize: QUERY_PAGE_SIZE,
    totalCount: undefined, // Backend doesn't provide total count
    changeQueryPage,
  });

  // Calculate the examples for the current page
  const startIndex = paginationState.pageWithinQueryBatch * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedExamples = examples?.slice(startIndex, endIndex) ?? [];

  return {
    examples: paginatedExamples,
    isLoading,
    error: error ?? null,
    paginationState,
  };
}
