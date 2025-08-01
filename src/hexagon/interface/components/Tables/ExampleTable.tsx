import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import usePagination from '@application/units/Pagination/usePagination';

import { useCallback, useEffect } from 'react';

import Loading from 'src/components/Loading/Loading';
import useBulkSelect from 'src/hexagon/application/units/useBulkSelect';
import ExampleListItem from '../ExampleListItem/FlashcardFinderExampleListItem';
import { Pagination } from '../general';
import {
  copyTableToClipboard,
  getExampleOrFlashcardById,
} from './units/functions';

import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

interface ExamplesTableProps {
  pageSize?: number;
  totalCount: number;
  dataSource: ExampleWithVocabulary[];
  displayOrder: DisplayOrder[];

  fetchingExamples: boolean;
}

export default function ExamplesTable({
  pageSize = 50,
  totalCount,
  dataSource,
  displayOrder,

  fetchingExamples,
}: ExamplesTableProps) {
  const {
    displayOrderSegment,
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
  } = usePagination({ displayOrder, itemsPerPage: pageSize });

  // const maxPage = Math.ceil(totalCount / pageSize); // BAD HACK. skipping pagination for now, we'll fix this later

  const { isExampleCollected, createFlashcards, deleteFlashcards } =
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
  } = useBulkSelect(async () => {
    await createFlashcards(bulkSelectIds);
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
  }, [displayOrder, maxPage, setPage]);

  if (fetchingExamples) {
    return <Loading message="Fetching Flashcards" />;
  }
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
          {bulkSelectMode ? 'Disable Bulk Add' : 'Enable Bulk Add'}
        </button>
        {bulkSelectMode && (
          <button
            className="bulkAddFlashcardsButton"
            type="button"
            onClick={triggerBulkOperation}
            disabled={bulkSelectIds.length === 0}
          >
            {bulkSelectIds.length > 0
              ? `Add ${bulkSelectIds.length} Flashcards`
              : 'Select Flashcards to Add'}
          </button>
        )}
      </div>
      <div className="buttonBox">
        <button
          type="button"
          onClick={() =>
            copyTableToClipboard({
              displayOrder,
              getExampleOrFlashcardById: getExampleById,
            })
          }
        >
          Copy Table
        </button>
        <div className="displayExamplesDescription">
          <h4>{`${totalCount} flashcards found (showing ${
            (page - 1) * pageSize + 1
          }-${Math.min(page * pageSize, totalCount)})`}</h4>
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
              isCollected={isExampleCollected(displayOrder.recordId)}
              isPending={
                bulkOperationInProgress &&
                bulkSelectIds.includes(displayOrder.recordId)
              }
              handleAdd={() => {
                if (bulkSelectMode) {
                  addToBulkSelect(displayOrder.recordId);
                } else {
                  createFlashcards([displayOrder.recordId]);
                }
              }}
              handleRemove={() => {
                deleteFlashcards([displayOrder.recordId]);
              }}
              handleRemoveSelected={() => {
                removeFromBulkSelect(displayOrder.recordId);
              }}
              handleSelect={() => {
                addToBulkSelect(displayOrder.recordId);
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
