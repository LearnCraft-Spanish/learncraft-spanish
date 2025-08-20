import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';

import type { UseStudentFlashcardsReturnType } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';

import { useRef, useState } from 'react';
import ellipsis from 'src/assets/icons/ellipsis-svgrepo-com.svg';
import { InlineLoading } from 'src/components/Loading';

// import useBulkSelect from 'src/hexagon/application/units/useBulkSelect';
import ExampleListItem from '../ExampleListItem/FlashcardFinderExampleListItem';
import { Pagination } from '../general';

import { copyTableToClipboard } from './units/functions';
import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

interface ExamplesTableProps {
  examples: ExampleWithVocabulary[];
  totalCount: number;
  studentFlashcards: UseStudentFlashcardsReturnType;
  paginationState: QueryPaginationState;
  firstPageLoading: boolean;
  newPageLoading: boolean;
  lessonPopup: LessonPopup;
  manageThese: () => void;
}

export default function ExamplesTable({
  examples,
  totalCount,
  studentFlashcards,
  paginationState,
  firstPageLoading,
  newPageLoading,
  lessonPopup,
  manageThese,
}: ExamplesTableProps) {
  const { page, maxPageNumber, nextPage, previousPage } = paginationState;

  // const {
  //   bulkSelectMode,
  //   bulkOperationInProgress,
  //   bulkSelectIds,
  //   addToBulkSelect,
  //   removeFromBulkSelect,
  //   clearBulkSelect,
  //   addAllToBulkSelect,
  //   // toggleBulkSelectMode,
  //   triggerBulkOperation,
  // } = useBulkSelect(async () => {
  //   await studentFlashcards.createFlashcards(bulkSelectIds);
  // });

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
  if (firstPageLoading) {
    return <InlineLoading message="Fetching Flashcards" />;
  }

  return (
    <div className="examplesTable">
      <div className="buttonBox">
        <div className="displayExamplesDescription">
          {newPageLoading ? (
            <InlineLoading message="Just a moment..." />
          ) : (
            <h4>
              {`${totalCount} example${
                examples.length === 1 ? '' : 's'
              } found ${
                maxPageNumber > 1
                  ? `(showing ${
                      (page - 1) * paginationState.pageSize + 1
                    }-${Math.min(paginationState.pageSize * page, totalCount)})`
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
                      displayOrder: examples.map((example) => ({
                        recordId: example.id,
                      })),
                      getExampleOrFlashcardById: (id) =>
                        examples.find((example) => example.id === id) ?? null,
                    });
                  }}
                >
                  <p>
                    Copy this page to clipboard{' '}
                    {`(${examples.length} item${
                      examples.length === 1 ? '' : 's'
                    })`}
                  </p>
                </button>
                <button type="button" onClick={manageThese}>
                  <p>Use these filters on my flashcards</p>
                </button>
                {/* <button
                    type="button"
                    onClick={() => {
                      copyTableToClipboard({
                        displayOrder: examples.map((example) => ({
                          recordId: example.id,
                        })),
                        getExampleOrFlashcardById: (id) =>
                          examples.find((example) => example.id === id) ?? null,
                      });
                    }}
                  >
                    <p>
                      Copy all results to clipboard{' '}
                      {`(${examples.length} item${
                        examples.length === 1 ? '' : 's'
                      })`}
                    </p>
                  </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
      <Pagination
        page={page}
        maxPage={maxPageNumber}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <div id="examplesTableBody">
        {newPageLoading ? (
          <InlineLoading message="Just a moment..." />
        ) : (
          examples.map((example: ExampleWithVocabulary) => {
            return (
              <ExampleListItem
                key={example.id}
                example={example}
                isCollected={studentFlashcards.isExampleCollected(example.id)}
                handleSingleAdd={async () => {
                  await studentFlashcards.createFlashcards([example.id]);
                }}
                handleRemove={async () => {
                  await studentFlashcards.deleteFlashcards([example.id]);
                }}
                lessonPopup={lessonPopup}
              />
            );
          })
        )}
      </div>

      <Pagination
        page={page}
        maxPage={maxPageNumber}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
}

/*
BULK SELECT BUTTONS:
* these were in the header, removing for now


<div id="bulkAddModeButtons">
            <button
              type="button"
              className="clearSelectionButton"
              onClick={() => {
                addAllToBulkSelect(
                  examples
                    .map((example) => example.id)
                    .filter((id) => !studentFlashcards.isExampleCollected(id)),
                );
              }}
            >
              Select All on Page
            </button>
            {bulkSelectIds.length > 0 && (
              <button
                className="bulkAddExamplesButton"
                type="button"
                onClick={triggerBulkOperation}
                disabled={bulkOperationInProgress}
              >
                {bulkSelectIds.length > 0
                  ? `Add ${bulkSelectIds.length} Example${
                      bulkSelectIds.length === 1 ? '' : 's'
                    }`
                  : 'Select Examples to Add'}
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
*/
