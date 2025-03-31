export default function QuantifiedRecords({
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
