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
  copyTableToClipboard,
  getExampleOrFlashcardById,
} from './units/functions';

import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

interface FlashcardTableProps {
  dataSource: Flashcard[];
  paginationState: ReturnType<typeof usePagination>;
  somethingIsLoading: boolean;
  lessonPopup: LessonPopup;
  findMore: () => void;
}

export default function FlashcardTable({
  dataSource,
  paginationState,
  somethingIsLoading,
  lessonPopup,
  findMore,
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
    bulkOperationInProgress,
    bulkSelectIds,
    addToBulkSelect,
    removeFromBulkSelect,
    clearBulkSelect,
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

  const isSelected = useCallback(
    (recordId: number) => {
      const flashcardToSelect = getExampleById(recordId) as Flashcard;
      if (!flashcardToSelect) {
        throw new Error('Flashcard not found');
      }
      return bulkSelectIds.includes(flashcardToSelect.example.id);
    },
    [bulkSelectIds, getExampleById],
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
          <div id="bulkAddModeButtons">
            {bulkSelectIds.length > 0 && (
              <button
                className="bulkRemoveFlashcardsButton"
                type="button"
                onClick={triggerBulkOperation}
                disabled={bulkOperationInProgress}
              >
                {bulkSelectIds.length > 0
                  ? `Remove ${bulkSelectIds.length} Flashcard${
                      bulkSelectIds.length === 1 ? '' : 's'
                    }`
                  : 'Select Flashcards to Remove'}
              </button>
            )}
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
          </div>
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
                <button
                  type="button"
                  onClick={() => {
                    copyTableToClipboard({
                      displayOrder: displayOrderSegment,
                      getExampleOrFlashcardById: getExampleById,
                    });
                  }}
                >
                  <p>
                    Copy this page to clipboard{' '}
                    {`(${displayOrderSegment.length} item${
                      displayOrderSegment.length === 1 ? '' : 's'
                    })`}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyTableToClipboard({
                      displayOrder: dataSource.map((flashcard) => ({
                        recordId: flashcard.id,
                      })),
                      getExampleOrFlashcardById: getExampleById,
                    });
                  }}
                >
                  <p>
                    Copy all results to clipboard{' '}
                    {`(${dataSource.length} item${
                      dataSource.length === 1 ? '' : 's'
                    })`}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    findMore();
                  }}
                >
                  <p>Find More Matching Flashcards</p>
                </button>
              </div>
            )}
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
                bulkOperationInProgress && isSelected(displayOrder.recordId)
              }
              handleSingleAdd={async () => {
                const flashcardToAdd = getExampleById(
                  displayOrder.recordId,
                ) as Flashcard;
                if (!flashcardToAdd) {
                  throw new Error('Flashcard not found');
                }
                await createFlashcards([flashcardToAdd.example.id]);
              }}
              handleSelect={() => {
                const flashcardToSelect = getExampleById(
                  displayOrder.recordId,
                ) as Flashcard;
                if (!flashcardToSelect) {
                  throw new Error('Flashcard not found');
                }
                addToBulkSelect(flashcardToSelect.example.id);
              }}
              handleRemove={async () => {
                const flashcardToRemove = getExampleById(
                  displayOrder.recordId,
                ) as Flashcard;
                if (!flashcardToRemove) {
                  throw new Error('Flashcard not found');
                }
                await deleteFlashcards([flashcardToRemove.example.id]);

                removeFromBulkSelect(flashcardToRemove.example.id);
              }}
              handleRemoveSelected={() => {
                const flashcardToRemove = getExampleById(
                  displayOrder.recordId,
                ) as Flashcard;
                if (!flashcardToRemove) {
                  throw new Error('Flashcard not found');
                }
                removeFromBulkSelect(flashcardToRemove.example.id);
              }}
              isSelected={isSelected(displayOrder.recordId)}
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
