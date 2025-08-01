import type usePagination from '@application/units/Pagination/usePagination';

import type { Flashcard } from '@learncraft-spanish/shared';
import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';

import { useCallback, useEffect } from 'react';

import useBulkSelect from 'src/hexagon/application/units/useBulkSelect';
import ExampleListItem from '../ExampleListItem/ExampleManagerExampleListItem';
import { Pagination } from '../general';
import {
  copyTableToClipboard,
  getExampleOrFlashcardById,
} from './units/functions';

import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

interface FlashcardTableProps {
  dataSource: Flashcard[];
  paginationState: ReturnType<typeof usePagination>;
}

export default function FlashcardTable({
  dataSource,
  paginationState,
}: FlashcardTableProps) {
  const {
    displayOrderSegment,
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
    pageSize,
  } = paginationState;
  const { isFlashcardCollected, createFlashcards, deleteFlashcards } =
    useStudentFlashcards();

  const {
    bulkSelectMode,
    bulkOperationInProgress,
    bulkSelectIds,
    addToBulkSelect,
    removeFromBulkSelect,
    clearBulkSelect,
    toggleBulkSelectMode,
    triggerBulkOperation,
  } = useBulkSelect(async (exampleIds: number[]) => {
    await deleteFlashcards(exampleIds);
  });

  const getExampleById = useCallback(
    (recordId: number) => {
      return getExampleOrFlashcardById(dataSource, recordId);
    },
    [dataSource],
  );

  useEffect(() => {
    if (maxPage === 1) {
      setPage(1);
    }
  }, [maxPage, setPage]);

  return (
    <div className="examplesTable">
      <div className="buttonBox bulkAddModeButtons">
        {bulkSelectMode && (
          <button
            className="clearSelectionButton"
            type="button"
            onClick={clearBulkSelect}
            disabled={bulkSelectIds.length === 0}
          >
            Clear Selection
          </button>
        )}

        <button
          className="toggleBulkAddModeButton"
          type="button"
          onClick={toggleBulkSelectMode}
        >
          {bulkSelectMode ? 'Disable Bulk Remove' : 'Enable Bulk Remove'}
        </button>
        {bulkSelectMode && (
          <button
            className="bulkAddFlashcardsButton"
            type="button"
            onClick={triggerBulkOperation}
            disabled={bulkSelectIds.length === 0}
          >
            {bulkSelectIds.length > 0
              ? `Remove ${bulkSelectIds.length} Flashcards`
              : 'Select Flashcards to Remove'}
          </button>
        )}
      </div>
      <div className="buttonBox">
        <button
          type="button"
          onClick={() =>
            copyTableToClipboard({
              displayOrder: dataSource.map((flashcard) => ({
                recordId: flashcard.id,
              })),
              getExampleOrFlashcardById: getExampleById,
            })
          }
        >
          Copy Table
        </button>
        <div className="displayExamplesDescription">
          <h4>{`${dataSource.length} flashcards found (showing ${
            (page - 1) * pageSize + 1
          }-${Math.min(page * pageSize, dataSource.length)})`}</h4>
        </div>
      </div>
      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <div id="examplesTableBody">
        {displayOrderSegment.map((displayOrder: DisplayOrder) => {
          return (
            <ExampleListItem
              key={displayOrder.recordId}
              example={getExampleById(displayOrder.recordId)}
              isCollected={isFlashcardCollected(displayOrder.recordId)}
              isPending={
                bulkOperationInProgress &&
                bulkSelectIds.includes(displayOrder.recordId)
              }
              handleAdd={() => {
                createFlashcards([displayOrder.recordId]);
              }}
              handleSelect={() => {
                addToBulkSelect(displayOrder.recordId);
              }}
              handleRemove={() => {
                deleteFlashcards([displayOrder.recordId]);
              }}
              handleRemoveSelected={() => {
                removeFromBulkSelect(displayOrder.recordId);
              }}
              bulkSelectMode={bulkSelectMode}
              isSelected={bulkSelectIds.includes(displayOrder.recordId)}
            />
          );
        })}
      </div>

      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
}
