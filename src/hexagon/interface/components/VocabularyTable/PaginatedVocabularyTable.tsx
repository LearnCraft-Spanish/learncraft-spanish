import type { VocabularyPaginationState } from '../../../application/useCases/useNonVerbCreation';
import React from 'react';
import './PaginatedVocabularyTable.scss';

interface PaginatedVocabularyTableProps {
  paginationState: VocabularyPaginationState;
  className?: string;
  emptyMessage?: string;
}

/**
 * Displays vocabulary items in a paginated table
 * Uses application layer pagination state without direct dependency on hooks
 */
export function PaginatedVocabularyTable({
  paginationState,
  className = '',
  emptyMessage = 'No vocabulary items found',
}: PaginatedVocabularyTableProps) {
  const {
    vocabularyItems,
    isLoading,
    isFetching,
    isCountLoading,
    error,
    totalCount,
    totalPages,
    hasMorePages,
    currentPage,
    goToNextPage,
    goToPreviousPage,
  } = paginationState;

  // Handle initial loading state (no data yet)
  if (isLoading && vocabularyItems.length === 0) {
    return (
      <div className="paginated-vocabulary__loading">
        <div className="paginated-vocabulary__loading-spinner" />
        <span>Loading vocabulary...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="paginated-vocabulary__error">
        <p className="paginated-vocabulary__error-title">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (vocabularyItems.length === 0) {
    return <div className="paginated-vocabulary__empty">{emptyMessage}</div>;
  }

  return (
    <div className={`paginated-vocabulary ${className}`}>
      <div className="paginated-vocabulary__info">
        {isCountLoading ? (
          <span>Loading count...</span>
        ) : (
          <span>
            Showing {vocabularyItems.length} of {totalCount ?? 'many'} items
          </span>
        )}
      </div>

      {/* Table implementation with overlay for loading transitions */}
      <div className="paginated-vocabulary__table-container">
        {/* Loading overlay shown during page transitions when we already have data */}
        {isLoading && vocabularyItems.length > 0 && (
          <div className="paginated-vocabulary__loading-overlay">
            <div className="paginated-vocabulary__loading-spinner" />
          </div>
        )}

        <table className="paginated-vocabulary__table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Description</th>
              <th>Spellings</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {vocabularyItems.map((item) => (
              <tr key={item.id}>
                <td>{item.word}</td>
                <td>
                  {item.descriptor.split(':')[1]?.trim() || item.descriptor}
                </td>
                <td>{item.spellings?.map((s) => s.value).join(', ') || ''}</td>
                <td>{item.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination control */}
      <div className="paginated-vocabulary__pagination">
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={currentPage <= 1 || isLoading}
          className={`paginated-vocabulary__pagination-button ${
            currentPage <= 1 || isLoading
              ? 'paginated-vocabulary__pagination-button--disabled'
              : ''
          }`}
        >
          Previous
        </button>

        <span className="paginated-vocabulary__pagination-info">
          Page {currentPage}
          {totalPages !== null
            ? ` of ${totalPages}`
            : hasMorePages
              ? ' (more)'
              : ''}
          {isFetching && ' ...'}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={
            (totalPages !== null && currentPage >= totalPages) ||
            !hasMorePages ||
            isLoading
          }
          className={`paginated-vocabulary__pagination-button ${
            (totalPages !== null && currentPage >= totalPages) ||
            !hasMorePages ||
            isLoading
              ? 'paginated-vocabulary__pagination-button--disabled'
              : ''
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
