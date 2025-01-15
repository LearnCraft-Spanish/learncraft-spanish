import { useState, useMemo } from 'react';
interface QuantifiedRecordsProps {
  currentPage: number;
  totalRecords: number;
  recordsPerPage: number;
}
export default function QuantifiedRecords({
  currentPage,
  totalRecords,
  recordsPerPage,
}: QuantifiedRecordsProps) {
  // const [firstRecordShown, setFirstRecordShown] = useState(1);
  // const [lastRecordShown, setLastRecordShown] = useState(50);
  // const [recordsPerPage, setRecordsPerPage] = useState(50);

  if (totalRecords === 0) {
    return <h5>Showing 0 records</h5>;
  }

  const firstRecordShown = useMemo(() => {
    return currentPage === 1 ? 1 : (currentPage - 1) * recordsPerPage + 1;
  }, [currentPage, recordsPerPage]);

  const lastRecordShown = useMemo(() => {
    return currentPage * recordsPerPage <= totalRecords
      ? currentPage * recordsPerPage
      : totalRecords;
  }, [currentPage, recordsPerPage, totalRecords]);

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
        {/* THIS NEEDS TO HAVE A CASE FOR 0 EXAMPLES
        showing {} - {} of {} found records Showing Records{' '}
        {page === 1 ? 1 : (page - 1) * 50} -{' '}
        {page * 50 <= weeks.length ? page * 50 : weeks.length} */}
      </h4>
    </div>
  );
}
