import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import React, { useState } from 'react';
import { useVocabularyQuery } from 'src/hexagon/application/queries/useVocabularyQuery';
import DeleteVocabularyRecord from './DeleteVocabularyRecord';
import './PaginatedVocabularyTable.scss';

interface PaginatedVocabularyTableProps {
  paginationState: QueryPaginationState;
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
  const [subcategoryId] = useState<number>(0);
  const {
    page,
    pageSize,
    pageWithinQueryBatch,
    maxPageNumber,
    previousPage,
    nextPage,
  } = paginationState;

  const { items, isLoading, error, totalCount, isCountLoading } =
    useVocabularyQuery(subcategoryId, pageSize);

  // Handle initial loading state (no data yet)
  if (isLoading && items.length === 0) {
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
  if (items.length === 0) {
    return <div className="paginated-vocabulary__empty">{emptyMessage}</div>;
  }

  return (
    <div className={`paginated-vocabulary ${className}`}>
      <div className="paginated-vocabulary__info">
        {isCountLoading ? (
          <span>Loading count...</span>
        ) : (
          <span>
            Showing {items.length} of {totalCount ?? 'many'} items
          </span>
        )}
      </div>

      {/* Table implementation with overlay for loading transitions */}
      <div className="paginated-vocabulary__table-container">
        {/* Loading overlay shown during page transitions when we already have data */}
        {isLoading && items.length > 0 && (
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
              <th className="paginated-vocabulary__table-header-delete">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.word}</td>
                <td>{item.descriptor}</td>
                <td>{item.spellings?.join(', ') || ''}</td>
                <td>{item.notes || ''}</td>
                <td>
                  <DeleteVocabularyRecord recordId={item.id.toString()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination control */}
      <div className="paginated-vocabulary__pagination">
        <button
          type="button"
          onClick={previousPage}
          disabled={page <= 1 || isLoading}
          className={`paginated-vocabulary__pagination-button ${
            page <= 1 || isLoading
              ? 'paginated-vocabulary__pagination-button--disabled'
              : ''
          }`}
        >
          Previous
        </button>

        <span className="paginated-vocabulary__pagination-info">
          Page {page}
          {maxPageNumber !== null
            ? ` of ${maxPageNumber}`
            : pageWithinQueryBatch !== null
              ? ` of ${pageWithinQueryBatch}`
              : ''}
          {isLoading && ' ...'}
        </span>

        <button
          type="button"
          onClick={nextPage}
          disabled={
            (maxPageNumber !== null && page >= maxPageNumber) ||
            !pageWithinQueryBatch ||
            isLoading
          }
          className={`paginated-vocabulary__pagination-button ${
            (maxPageNumber !== null && page >= maxPageNumber) ||
            !pageWithinQueryBatch ||
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
