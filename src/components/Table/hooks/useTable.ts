import type { FilterConfig, SortConfig } from '../types';
import { usePagination } from '@application/units/Pagination/usePagination';
// src/components/Table/hooks/useTable.ts
import { useMemo } from 'react';
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

  const {
    pageNumber: page,
    maxPageNumber: maxPage,
    nextPage,
    previousPage,
    startIndex,
    endIndex,
  } = usePagination({
    itemsPerPage,
    totalItems: sortedData.length,
  });

  const displayData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

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
