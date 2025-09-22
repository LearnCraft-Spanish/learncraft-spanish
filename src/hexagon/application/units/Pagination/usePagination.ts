import { useCallback, useMemo, useRef, useState } from 'react';

export interface PaginationState {
  totalItems: number;
  pageNumber: number;
  maxPageNumber: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  isOnFirstPage: boolean;
  isOnLastPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  goToFirstPage: () => void;
}

export function usePagination({
  itemsPerPage = 50,
  totalItems,
}: {
  itemsPerPage: number;
  totalItems: number;
}): PaginationState {
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const previousTotalItems = useRef(0);
  const maxPage = Math.ceil(totalItems / itemsPerPage);

  const safePageNumber = useMemo(() => {
    if (previousTotalItems.current !== totalItems) {
      previousTotalItems.current = totalItems;
      return 1;
    }
    if (selectedPageNumber > maxPage) {
      return maxPage;
    }
    if (selectedPageNumber < 1) {
      return 1;
    }
    return selectedPageNumber;
  }, [selectedPageNumber, maxPage, totalItems]);

  const startIndex = useMemo(() => {
    return (safePageNumber - 1) * itemsPerPage;
  }, [safePageNumber, itemsPerPage]);

  const endIndex = useMemo(() => {
    return startIndex + itemsPerPage;
  }, [startIndex, itemsPerPage]);

  const nextPage = useCallback(() => {
    if (safePageNumber >= maxPage) {
      return;
    }
    setSelectedPageNumber(safePageNumber + 1);
  }, [safePageNumber, maxPage]);

  const previousPage = useCallback(() => {
    if (safePageNumber <= 1) {
      return;
    }
    setSelectedPageNumber(safePageNumber - 1);
  }, [safePageNumber]);

  const goToFirstPage = useCallback(() => {
    setSelectedPageNumber(1);
  }, []);

  const isOnFirstPage = useMemo(() => {
    return safePageNumber === 1;
  }, [safePageNumber]);

  const isOnLastPage = useMemo(() => {
    return safePageNumber === maxPage;
  }, [safePageNumber, maxPage]);

  return {
    totalItems,
    pageNumber: safePageNumber,
    pageSize: itemsPerPage,
    maxPageNumber: maxPage,
    startIndex,
    endIndex,
    isOnFirstPage,
    isOnLastPage,
    nextPage,
    previousPage,
    goToFirstPage,
  };
}
