import type { UseStudentFlashcardsReturnType } from '@application/queries/useStudentFlashcards';

import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { ExampleWithVocabulary, Lesson } from '@learncraft-spanish/shared';
import Loading from 'src/components/Loading/Loading';

import useBulkSelect from 'src/hexagon/application/units/useBulkSelect';
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
  fetchingExamples: boolean;
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
}

export default function ExamplesTable({
  examples,
  totalCount,
  studentFlashcards,
  paginationState,
  fetchingExamples,
  lessonsByVocabulary,
  lessonsLoading,
}: ExamplesTableProps) {
  const { page, maxPageNumber, nextPage, previousPage } = paginationState;

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
    await studentFlashcards.createFlashcards(bulkSelectIds);
  });

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
              displayOrder: examples.map((example) => ({
                recordId: example.id,
              })),
              getExampleOrFlashcardById: (id: number) =>
                examples.find((example) => example.id === id) ?? null,
            })
          }
        >
          Copy Table
        </button>
        <div className="displayExamplesDescription">
          <h4>{`${totalCount} flashcards found (showing ${
            (page - 1) * paginationState.pageSize + 1
          }-${Math.min(paginationState.pageSize * page, totalCount)})`}</h4>
        </div>
      </div>
      <Pagination
        page={page}
        maxPage={maxPageNumber}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <div id="examplesTableBody">
        {examples.map((example: ExampleWithVocabulary) => {
          return (
            <ExampleListItem
              key={example.id}
              example={example}
              isCollected={studentFlashcards.isExampleCollected(example.id)}
              isPending={
                bulkOperationInProgress && bulkSelectIds.includes(example.id)
              }
              handleAdd={() => {
                if (bulkSelectMode) {
                  addToBulkSelect(example.id);
                } else {
                  studentFlashcards.createFlashcards([example.id]);
                }
              }}
              handleRemove={() => {
                studentFlashcards.deleteFlashcards([example.id]);
              }}
              handleRemoveSelected={() => {
                removeFromBulkSelect(example.id);
              }}
              handleSelect={() => {
                addToBulkSelect(example.id);
              }}
              bulkSelectMode={bulkSelectMode}
              isSelected={bulkSelectIds.includes(example.id)}
              lessonsByVocabulary={lessonsByVocabulary}
              lessonsLoading={lessonsLoading}
            />
          );
        })}
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
