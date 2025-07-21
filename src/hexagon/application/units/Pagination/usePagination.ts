import type { DisplayOrder } from 'src/types/interfaceDefinitions';

import { useState } from 'react';

export default function usePagination({
  itemsPerPage = 50,
  displayOrder,
}: {
  itemsPerPage?: number;
  displayOrder: DisplayOrder[];
}) {
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(displayOrder.length / itemsPerPage);

  const displayOrderSegment = displayOrder.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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
  };
}
