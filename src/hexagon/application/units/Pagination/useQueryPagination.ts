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
}
export default function useQueryPagination({
  queryPage,
  pageSize = 25,
  queryPageSize = 100,
  totalCount,
  changeQueryPage,
}: {
  queryPage: number;
  pageSize: number;
  queryPageSize: number;
  totalCount: number | undefined;
  changeQueryPage: (page: number) => void;
}): QueryPaginationState {
  const [page, setPage] = useState(1);
  const maxPageNumber: number = totalCount
    ? Math.ceil(totalCount / pageSize)
    : 0;

  const pagesPerQuery = Math.ceil(queryPageSize / pageSize);
  const pageWithinQueryBatch = page % pagesPerQuery;

  const maxPageName: string =
    maxPageNumber === 0 ? 'many' : maxPageNumber.toString();

  const nextPage = useCallback(() => {
    if (page === maxPageNumber) {
      return;
    }
    setPage(page + 1);
    changeQueryPage(Math.ceil((page + 1) / pagesPerQuery));
  }, [page, maxPageNumber, changeQueryPage, pagesPerQuery]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
    changeQueryPage(Math.ceil((page - 1) / pagesPerQuery));
  }, [page, changeQueryPage, pagesPerQuery]);

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
  };
}
