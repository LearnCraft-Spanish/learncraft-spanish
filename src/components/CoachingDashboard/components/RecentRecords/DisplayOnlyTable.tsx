import type { ReactNode } from 'react';
import { usePagination } from '@application/units/Pagination/usePagination';
import { Pagination } from '@interface/components/general';
import React, { useMemo } from 'react';

import 'src/components/Table/Table.scss';

export default function DisplayOnlyTable({
  headers,
  data,
  renderRow,
  onClickFunc,
  itemsPerPage = 20,
}: {
  headers: string[];
  data: any[];
  renderRow: (item: any, onClick?: (str: string) => void) => ReactNode;
  onClickFunc?: (str: string) => void;
  itemsPerPage?: number;
}) {
  const {
    pageNumber: page,
    maxPageNumber: maxPage,
    nextPage,
    previousPage,
    startIndex,
    endIndex,
  } = usePagination({
    itemsPerPage,
    totalItems: data.length,
  });

  const displayData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex],
  );

  return (
    <div className="table-wrapper">
      <div className="body-container">
        {/* <div className="numberShowing">
          <QuantifiedRecords
            currentPage={page}
            totalRecords={totalRecordsFound}
            recordsPerPage={itemsPerPage}
          />
        </div> */}
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
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length > 0 ? (
              displayData.map((item) => {
                if (onClickFunc) {
                  return renderRow(item, onClickFunc);
                }
                return renderRow(item);
              })
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
