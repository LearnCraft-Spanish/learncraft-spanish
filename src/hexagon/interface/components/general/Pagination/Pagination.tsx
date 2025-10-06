import arrowUp from 'src/assets/icons/arrow-up.svg';
import './Pagination.scss';

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
        {/* Previous Button */}

        <button
          type="button"
          onClick={previousPage}
          className={`paginationButton ${page === 1 ? 'disabled' : ''}`}
        >
          <span className="paginationText">Previous</span>
          <img
            src={arrowUp}
            alt="Previous"
            className={`paginationArrow previous ${page === 1 ? 'disabled' : ''}`}
          />
        </button>

        <p>
          Page {page} of {maxPage}
        </p>

        {/* Next Button */}

        <button
          type="button"
          onClick={nextPage}
          className={`paginationButton ${page === maxPage ? 'disabled' : ''}`}
        >
          <span className="paginationText">Next</span>
          <img
            src={arrowUp}
            alt="Next"
            className={`paginationArrow next ${page === maxPage ? 'disabled' : ''}`}
          />
        </button>
      </div>
    )
  );
}
