export default function Pagination({
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
        {page === 1 && (
          <button
            type="button"
            onClick={() => {}}
            disabled
            className="disabledButton"
          >
            Previous
          </button>
        )}
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
