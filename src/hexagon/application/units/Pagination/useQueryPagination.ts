import { useCallback, useState } from 'react';

export interface QueryPaginationState {
  page: number;
  queryPage: number;
  pageSize: number;
  pagesPerQuery: number;
  pageWithinQueryBatch: number;
  maxPageNumber: number;
  maxPageName: string;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  resetPagination: () => void;
}

export interface UseQueryPaginationParams {
  queryPage: number;
  pageSize: number;
  queryPageSize: number;
  totalCount: number | undefined;
  changeQueryPage: (page: number) => void;
}
export function useQueryPagination({
  queryPage,
  pageSize,
  queryPageSize,
  totalCount,
  changeQueryPage,
}: UseQueryPaginationParams): QueryPaginationState {
  const [page, setPage] = useState(1);
  const maxPageNumber: number = totalCount
    ? Math.ceil(totalCount / pageSize)
    : 0;

  const pagesPerQuery = Math.floor(queryPageSize / pageSize);

  const pageWithinQueryBatch = (page - 1) % pagesPerQuery;

  const maxPageName: string =
    maxPageNumber === 0 ? 'many' : maxPageNumber.toString();

  const goToPage = useCallback(
    (nextPageNumber: number): void => {
      if (nextPageNumber < 1 || nextPageNumber === page) {
        return;
      }
      if (maxPageNumber > 0 && nextPageNumber > maxPageNumber) {
        return;
      }
      setPage(nextPageNumber);
      changeQueryPage(Math.ceil(nextPageNumber / pagesPerQuery));
    },
    [page, maxPageNumber, changeQueryPage, pagesPerQuery],
  );

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [goToPage, page]);

  const previousPage = useCallback(() => {
    goToPage(page - 1);
  }, [goToPage, page]);

  const resetPagination = useCallback(() => {
    setPage(1);
    changeQueryPage(1);
  }, [changeQueryPage]);

  return {
    page,
    queryPage,
    pagesPerQuery,
    pageWithinQueryBatch,
    pageSize,
    maxPageNumber,
    maxPageName,
    nextPage,
    previousPage,
    goToPage,
    resetPagination,
  };
}
