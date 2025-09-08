import type { DisplayOrder } from 'src/types/interfaceDefinitions';

import { useEffect, useMemo, useState } from 'react';

export interface UsePaginationReturn {
  displayOrderSegment: DisplayOrder[];
  page: number;
  maxPage: number;
  nextPage: () => void;
  previousPage: () => void;
  setPage: (page: number) => void;
  pageSize: number;
  firstItemInPage: number;
}

export default function usePagination({
  itemsPerPage = 50,
  displayOrder,
}: {
  itemsPerPage: number;
  displayOrder: DisplayOrder[];
}): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(displayOrder.length / itemsPerPage);

  const displayOrderSegment = displayOrder.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const firstItemInPage = useMemo(() => {
    if (page === 1 && displayOrder.length > 0) {
      return 1;
    } else if (displayOrder.length === 0) {
      return 0;
    } else {
      return (page - 1) * itemsPerPage + 1;
    }
  }, [page, itemsPerPage, displayOrder]);

  useEffect(() => {
    if (page > maxPage && maxPage > 0) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setPage(maxPage);
    }
  }, [page, maxPage]);

  return {
    displayOrderSegment,
    page,
    maxPage,
    nextPage: () => {
      if (page >= maxPage) {
        return;
      }
      setPage(page + 1);
    },
    previousPage: () => {
      if (page <= 1) {
        return;
      }
      setPage(page - 1);
    },
    setPage,
    pageSize: itemsPerPage,
    firstItemInPage,
  };
}
