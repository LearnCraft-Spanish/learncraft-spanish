import type { VocabularyPaginationState } from '../../../application/useCases/useNonVerbCreation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useModal } from 'src/hooks/useModal';
import { useAllRecordsAssociatedWithVocabularyRecord } from '../../../application/units/useAllRecordsAssociatedWithVocabularyRecord';
import './PaginatedVocabularyTable.scss';
import { useQuery } from '@tanstack/react-query';
import { useVocabularyAdapter } from 'src/hexagon/application/adapters/vocabularyAdapter';
import DeleteVocabularyRecord from './DeleteVocabularyRecord';

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
    isLoading,
    error,
    vocabularyItems,
    isFetching,
    isCountLoading,
    totalCount,
    totalPages,
    hasMorePages,
    currentPage,
    goToNextPage,
    goToPreviousPage,
    deleteVocabulary,
  } = paginationState;

  const [vocabId, setVocabId] = useState<string | undefined>(undefined);
  const { getAllRecordsAssociatedWithVocabularyRecord } =
    useVocabularyAdapter();
  // const {
  //   data: relatedRecords,
  //   isLoading: isRelatedRecordsLoading,
  //   error: relatedRecordsError,
  // } = useAllRecordsAssociatedWithVocabularyRecord(vocabId);
  const {
    data: relatedRecords,
    isLoading: isRelatedRecordsLoading,
    error: relatedRecordsError,
  } = useQuery({
    queryKey: ['vocabulary-related-records', vocabId],
    queryFn: () => getAllRecordsAssociatedWithVocabularyRecord(vocabId ?? ''),
    enabled: !!vocabId,
  });

  const { openModal, closeModal } = useModal();

  const handleDelete = (id: string) => {
    setVocabId(id);
    // figure out how to get the related records
    openModal({
      title: 'Delete Vocabulary',
      body: 'Are you sure you want to delete this vocabulary?',
      type: 'confirm',
      confirmFunction: async () => {
        // const promise = deleteVocabulary(id);
        // toast.promise(promise, {
        //   pending: 'Deleting vocabulary...',
        //   success: 'Vocabulary deleted successfully',
        //   error: 'Failed to delete vocabulary',
        // });
        closeModal();
      },
    });
  };

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
                <td>{item.spellings?.map((s) => s.value).join(', ') || ''}</td>
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
