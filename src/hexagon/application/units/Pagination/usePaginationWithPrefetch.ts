import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import { useEffect } from 'react';
import { usePagination } from './usePagination';

export default function usePaginationWithPrefetch({
  itemsPerPage = 50,
  displayOrder,
  prefetchNextBatch,
}: {
  itemsPerPage?: number;
  displayOrder: DisplayOrder[];
  prefetchNextBatch: () => void;
}) {
  const { page, maxPage, nextPage, previousPage, setPage } = usePagination({
    itemsPerPage,
    displayOrder,
  });

  useEffect(() => {
    prefetchNextBatch();
  }, [prefetchNextBatch]);

  return {
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
  };
}
