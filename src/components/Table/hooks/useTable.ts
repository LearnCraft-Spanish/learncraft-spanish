import type { FilterConfig, SortConfig } from '../types';
// src/components/Table/hooks/useTable.ts
import { useMemo } from 'react';
import { usePaginatedTable } from './';
import useFilter from './useFilter';
import useSort from './useSort';

interface UseTableProps<T> {
  data: T[];
  itemsPerPage?: number;
  sortFunction: (data: T[], sortConfig: SortConfig) => T[];
  filterFunction: (data: T[], filterConfig: FilterConfig) => T[];
}

export default function useTable<T>({
  data,
  itemsPerPage = 20,
  sortFunction,
  filterFunction,
}: UseTableProps<T>) {
  const { filterConfig, setFilterConfig, filteredData } = useFilter(
    data,
    filterFunction,
  );

  const { sortConfig, updateSortConfig, sortedData } = useSort(
    filteredData,
    sortFunction,
  );

  const { page, maxPage, getDisplayData, nextPage, previousPage } =
    usePaginatedTable({
      data: sortedData,
      itemsPerPage,
    });

  const displayData = useMemo(() => {
    return getDisplayData(sortedData);
  }, [sortedData, getDisplayData]);

  return {
    filterConfig,
    setFilterConfig,
    sortConfig,
    updateSortConfig,
    page,
    maxPage,
    nextPage,
    previousPage,
    displayData,
    totalRecordsFound: filteredData.length,
  };
}
