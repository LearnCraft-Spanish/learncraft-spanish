import type { SortConfig } from '../types';
import { useMemo, useState } from 'react';

export default function useSort<T>(
  data: T[],
  sortFunction: (data: T[], sortConfig: SortConfig) => T[],
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'none',
  });

  const updateSortConfig = (header: string) => {
    setSortConfig((currentConfig) => {
      // If clicking a different header, start with ascending
      if (currentConfig.key !== header) {
        return {
          key: header,
          direction: 'ascending',
        };
      }

      // If clicking the same header, cycle through: ascending -> descending -> none
      switch (currentConfig.direction) {
        case 'ascending':
          return {
            key: header,
            direction: 'descending',
          };
        case 'descending':
          return {
            key: '',
            direction: 'none',
          };
        case 'none':
        default:
          return {
            key: header,
            direction: 'ascending',
          };
      }
    });
  };

  const sortedData = useMemo(() => {
    return sortFunction(data, sortConfig);
  }, [data, sortConfig, sortFunction]);

  return { sortConfig, updateSortConfig, sortedData };
}
