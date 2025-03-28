import type { ReactNode} from 'react';
import { useCallback, useMemo, useState } from 'react';
import '../VocabQuizDbTables.scss';

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T) => ReactNode;
  itemsPerPage?: number;
  sortConfig?: {
    key: string;
    direction: 'ascending' | 'descending' | 'none';
  };
  onSort: (header: string) => void;
}

function QuantifiedRecords({
  currentPage,
  totalRecords,
  recordsPerPage,
}: {
  currentPage: number;
  totalRecords: number;
  recordsPerPage: number;
}) {
  if (totalRecords === 0) {
    return <h5>Showing 0 records</h5>;
  }

  const firstRecordShown =
    currentPage === 1 ? 1 : (currentPage - 1) * recordsPerPage + 1;

  const lastRecordShown =
    currentPage * recordsPerPage <= totalRecords
      ? currentPage * recordsPerPage
      : totalRecords;

  return (
    <div className="quantifiedRecords">
      <h4>
        {totalRecords === 1 ? (
          <>Showing 1 record</>
        ) : (
          <>
            showing {firstRecordShown} - {lastRecordShown} of {totalRecords}{' '}
            records
          </>
        )}
      </h4>
    </div>
  );
}

function Pagination({
  page,
  maxPage,
  nextPage,
  previousPage,
}: {
  page: number;
  maxPage: number;
  nextPage: () => void;
  previousPage: () => void;
}) {
  return (
    maxPage > 1 && (
      <div className="pagination">
        {page !== 1 && (
          <button type="button" onClick={previousPage}>
            Previous
          </button>
        )}
        {page === 1 && <div className="label disabledButton">Previous</div>}
        <p>
          Page {page} of {maxPage}
        </p>
        {page !== maxPage && (
          <button type="button" onClick={nextPage}>
            Next
          </button>
        )}
        {page === maxPage && <div className="label disabledButton">Next</div>}
      </div>
    )
  );
}

export default function Table<T>({
  headers,
  data,
  renderRow,
  itemsPerPage = 20,
  sortConfig,
  onSort,
}: TableProps<T>) {
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(data.length / itemsPerPage);

  const displayData = useMemo(() => {
    return data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [data, page, itemsPerPage]);

  const nextPage = useCallback(() => {
    if (page >= maxPage) {
      return;
    }
    setPage(page + 1);
  }, [page, maxPage]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
  }, [page]);

  // Reset page when data changes
  useMemo(() => {
    if (data.length < (page - 1) * itemsPerPage) {
      setPage(1);
    }
  }, [data.length, page, itemsPerPage]);

  return (
    <>
      <div className="numberShowing">
        <QuantifiedRecords
          currentPage={page}
          totalRecords={data.length}
          recordsPerPage={itemsPerPage}
        />
      </div>
      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <div className="tableWrapper">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className={sortConfig ? 'sortable' : ''}
                  onClick={() => onSort(header)}
                >
                  <div className="thContentWrapper">
                    {sortConfig?.key === header && (
                      <div
                        className="sortIcon"
                        style={{
                          transform:
                            sortConfig.direction === 'descending'
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                        }}
                      >
                        ▲
                      </div>
                    )}
                    <div>{header}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{displayData.map((item) => renderRow(item))}</tbody>
        </table>
      </div>
      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </>
  );
}
