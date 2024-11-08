import React from 'react';

interface PaginationProps {
  page: number;
  maxPage: number;
  nextPage: () => void;
  previousPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  maxPage,
  nextPage,
  previousPage,
}: PaginationProps) => {
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
};

export default Pagination;
