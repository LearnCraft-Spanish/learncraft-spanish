import { useCallback, useMemo, useState } from 'react';

export default function usePaginatedTable<T>({
  data,
  itemsPerPage,
}: {
  data: T[];
  itemsPerPage: number;
}) {
  const [page, setPage] = useState(1);
  const maxPage = Math.max(1, Math.ceil(data.length / itemsPerPage));

  // utility functions
  const nextPage = useCallback(() => {
    if (page >= maxPage) {
      return;
    }
    setPage(page + 1);
  }, [page, maxPage]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
  }, [page]);

  // Reset page when data changes
  useMemo(() => {
    if (data.length < (page - 1) * itemsPerPage) {
      setPage(1);
    }
  }, [data.length, page, itemsPerPage]);

  const getDisplayData = useCallback(
    (sortedData: T[]) => {
      return sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    },
    [page, itemsPerPage],
  );

  return { page, maxPage, getDisplayData, nextPage, previousPage };
}
