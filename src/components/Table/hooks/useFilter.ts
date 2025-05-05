import type { FilterConfig } from '../types';
// src/components/Table/hooks/useFilter.ts
import { useMemo, useState } from 'react';

export default function useFilter<T>(
  data: T[],
  filterFunction: (data: T[], filterConfig: FilterConfig) => T[],
) {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    field: '',
    value: '',
    operator: '',
  });

  const filteredData = useMemo(() => {
    return filterFunction(data, filterConfig);
  }, [data, filterConfig, filterFunction]);

  return {
    filterConfig,
    setFilterConfig,
    filteredData,
  };
}
