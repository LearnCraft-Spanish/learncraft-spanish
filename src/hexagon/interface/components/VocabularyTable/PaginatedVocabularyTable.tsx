import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { Vocabulary } from '@learncraft-spanish/shared';
import React from 'react';
import DeleteVocabularyRecord from './DeleteVocabularyRecord';
import './PaginatedVocabularyTable.scss';

interface PaginatedVocabularyTableProps {
  paginationState: QueryPaginationState;
  vocabularyItems: Vocabulary[];
  totalCount: number | null;
  isVocabularyLoading: boolean;
  vocabularyError: Error | null;
  className?: string;
  emptyMessage?: string;
}

/**
 * Displays vocabulary items in a paginated table
 * Uses application layer pagination state without direct dependency on hooks
 */
export function PaginatedVocabularyTable({
  paginationState,
  vocabularyItems,
  totalCount,
  isVocabularyLoading,
  vocabularyError,
  className = '',
  emptyMessage = 'No vocabulary items found',
}: PaginatedVocabularyTableProps) {
  const { page, maxPageNumber, previousPage, nextPage } = paginationState;

  // Handle initial loading state (no data yet)
  if (isVocabularyLoading && vocabularyItems.length === 0) {
    return (
      <div className="paginated-vocabulary__loading">
        <div className="paginated-vocabulary__loading-spinner" />
        <span>Loading vocabulary...</span>
      </div>
    );
  }

  // Handle error state
  if (vocabularyError) {
    return (
      <div className="paginated-vocabulary__error">
        <p className="paginated-vocabulary__error-title">Error</p>
        <p>{vocabularyError.message}</p>
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
        {isVocabularyLoading ? (
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
        {isVocabularyLoading && vocabularyItems.length > 0 && (
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
            {vocabularyItems.map((item) => (
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
          disabled={page <= 1 || isVocabularyLoading}
          className={`paginated-vocabulary__pagination-button ${
            page <= 1 || isVocabularyLoading
              ? 'paginated-vocabulary__pagination-button--disabled'
              : ''
          }`}
        >
          Previous
        </button>

        <span className="paginated-vocabulary__pagination-info">
          Page {page} of
          {maxPageNumber !== null ? ` ${maxPageNumber}` : ' many'}
        </span>

        <button
          type="button"
          onClick={nextPage}
          disabled={
            (maxPageNumber !== null && page >= maxPageNumber) ||
            isVocabularyLoading
          }
          className={`paginated-vocabulary__pagination-button ${
            (maxPageNumber !== null && page >= maxPageNumber) ||
            isVocabularyLoading
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
