import type usePagination from '@application/units/Pagination/usePagination';

import type { Flashcard } from '@learncraft-spanish/shared';
import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import type { DisplayOrder } from 'src/types/interfaceDefinitions';

import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';

import { useCallback, useEffect, useRef, useState } from 'react';
import ellipsis from 'src/assets/icons/ellipsis-svgrepo-com.svg';
import useBulkSelect from 'src/hexagon/application/units/useBulkSelect';
import ExampleListItem from '../ExampleListItem/ExampleManagerExampleListItem';
import { Pagination } from '../general';

import { InlineLoading } from '../Loading';
import {
  // copyTableToClipboard,
  getExampleOrFlashcardById,
} from './units/functions';

import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

interface FlashcardTableProps {
  dataSource: Flashcard[];
  paginationState: ReturnType<typeof usePagination>;
  somethingIsLoading: boolean;
  lessonPopup: LessonPopup;
}

export default function FlashcardTable({
  dataSource,
  paginationState,
  somethingIsLoading,
  lessonPopup,
}: FlashcardTableProps) {
  const {
    displayOrderSegment,
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
    pageSize,
    firstItemInPage,
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
    // toggleBulkSelectMode,
    triggerBulkOperation,
  } = useBulkSelect(async (exampleIds: number[]) => {
    await deleteFlashcards(exampleIds);
  });

  const [isTableOptionsOpen, setIsTableOptionsOpen] = useState(false);
  const hideTableOptionsTimeout = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (hideTableOptionsTimeout.current) {
      clearTimeout(hideTableOptionsTimeout.current);
    }
    setIsTableOptionsOpen(true);
  };

  const hide = () => {
    hideTableOptionsTimeout.current = setTimeout(
      () => setIsTableOptionsOpen(false),
      200,
    ); // slight delay
  };

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
      <div className="buttonBox">
        <div className="displayExamplesDescription">
          {somethingIsLoading ? (
            <InlineLoading message="Just a moment..." />
          ) : (
            <h4>
              {`${dataSource.length} flashcard${
                dataSource.length === 1 ? '' : 's'
              } found ${
                maxPage > 1
                  ? `(showing ${firstItemInPage}-${Math.min(
                      page * pageSize,
                      dataSource.length,
                    )})`
                  : ''
              }`}
            </h4>
          )}

          <div id="bulkAddModeButtons">
            {bulkSelectIds.length > 0 && (
              <button
                className="clearSelectionButton"
                type="button"
                onClick={clearBulkSelect}
                disabled={bulkSelectIds.length === 0}
              >
                Clear Selection
              </button>
            )}

            {bulkSelectIds.length > 0 && (
              <button
                className="bulkAddFlashcardsButton"
                type="button"
                onClick={triggerBulkOperation}
                disabled={bulkSelectIds.length === 0}
              >
                {bulkSelectIds.length > 0
                  ? `Remove ${bulkSelectIds.length} Flashcard${
                      bulkSelectIds.length === 1 ? '' : 's'
                    }`
                  : 'Select Flashcards to Remove'}
              </button>
            )}

            <div className="tableOptionsWrapper">
              <button
                type="button"
                className="tableOptionsButton"
                onMouseEnter={show}
                onMouseLeave={hide}
              >
                <img src={ellipsis} alt="Table Options" />
              </button>
              {isTableOptionsOpen && (
                <div
                  className="tableOptions"
                  onMouseEnter={show}
                  onMouseLeave={hide}
                >
                  <button type="button">
                    <p>Copy this page to clipboard</p>
                  </button>
                  <button type="button">
                    <p>Copy all results to clipboard</p>
                  </button>
                  <button type="button">
                    <p>Use these filters in Flashcard Finder</p>
                  </button>
                </div>
              )}
            </div>
          </div>
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
              lessonPopup={lessonPopup}
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
