// coaching interface
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { FilterConfig, HeaderObject, SortConfig } from './types';
import React from 'react';
import { Pagination, QuantifiedRecords } from './components';
import HeaderCell from './components/HeaderCell';
import useTable from './hooks/useTable';

import './Table.scss';

interface TableProps<T> {
  headers: HeaderObject[];
  data: T[];
  renderRow: (item: T) => ReactNode | null;
  itemsPerPage?: number;
  sortFunction: (data: T[], sortConfig: SortConfig) => T[];
  filterFunction?: (data: T[], filterConfig: FilterConfig) => T[];
  filterComponent?: React.ComponentType<{
    filterConfig: FilterConfig;
    setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
  }>;
}

export default function Table<T>({
  headers,
  data,
  renderRow,
  itemsPerPage = 20,
  sortFunction,
  filterFunction,
  filterComponent,
}: TableProps<T>) {
  const {
    filterConfig,
    setFilterConfig,
    sortConfig,
    updateSortConfig,
    page,
    maxPage,
    nextPage,
    previousPage,
    displayData,
    totalRecordsFound,
  } = useTable({
    data,
    itemsPerPage,
    sortFunction,
    filterFunction:
      filterFunction || ((data: T[], _filterConfig: FilterConfig) => data),
  });

  return (
    <div className="table-wrapper">
      {filterComponent && (
        <div className="filter-container">
          {React.createElement(filterComponent, {
            filterConfig,
            setFilterConfig,
          })}
        </div>
      )}
      <div className="body-container">
        <div className="numberShowing">
          <QuantifiedRecords
            currentPage={page}
            totalRecords={totalRecordsFound}
            recordsPerPage={itemsPerPage}
          />
        </div>
        <Pagination
          page={page}
          maxPage={maxPage}
          nextPage={nextPage}
          previousPage={previousPage}
        />
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <HeaderCell
                  key={header.header}
                  headerObject={header}
                  sortConfig={sortConfig}
                  sortBy={updateSortConfig}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((item) => renderRow(item))
            ) : (
              <tr>
                <td colSpan={headers.length} className="noResults">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          maxPage={maxPage}
          nextPage={nextPage}
          previousPage={previousPage}
        />
      </div>
    </div>
  );
}
