import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import usePagination from '@application/units/Pagination/usePagination';

import { useCallback, useEffect, useState } from 'react';

import Loading from 'src/components/Loading/Loading';
import ExampleListItem from '../ExampleListItem/FlashcardFinderExampleListItem';
import { Pagination } from '../general';
import {
  copyTableToClipboard,
  getExampleById as getExampleByIdFunction,
} from './units/functions';
import 'src/components/ExamplesTable/ExamplesTable.scss';

import './ExampleTable.scss';

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

  const [bulkAddMode, setBulkAddMode] = useState(false);
  const [addingInProgress, setAddingInProgress] = useState(false);

  const [bulkAddIds, setBulkAddIds] = useState<number[]>([]);

  const getExampleById = useCallback(
    (recordId: number) => {
      return getExampleByIdFunction(dataSource, recordId);
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
        {bulkAddMode && (
          <button
            className="clearSelectionButton"
            type="button"
            onClick={() => {
              setBulkAddIds([]);
            }}
            disabled={bulkAddIds.length === 0}
          >
            Clear Selection
          </button>
        )}

        <button
          className="toggleBulkAddModeButton"
          type="button"
          onClick={() => {
            setBulkAddMode(!bulkAddMode);
          }}
        >
          {bulkAddMode ? 'Disable Bulk Add' : 'Enable Bulk Add'}
        </button>
        {bulkAddMode && (
          <button
            className="bulkAddFlashcardsButton"
            type="button"
            onClick={() => {
              setAddingInProgress(true);
              const promise = createFlashcards(bulkAddIds);
              promise.then(() => {
                setAddingInProgress(false);
                setBulkAddIds([]);
              });
            }}
            disabled={bulkAddIds.length === 0}
          >
            {bulkAddIds.length > 0
              ? `Add ${bulkAddIds.length} Flashcards`
              : 'Select Flashcards to Add'}
          </button>
        )}
      </div>
      <div className="buttonBox">
        <button
          type="button"
          onClick={() => copyTableToClipboard({ displayOrder, getExampleById })}
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
                addingInProgress && bulkAddIds.includes(displayOrder.recordId)
              }
              handleAdd={() => {
                if (bulkAddMode) {
                  setBulkAddIds([...bulkAddIds, displayOrder.recordId]);
                } else {
                  createFlashcards([displayOrder.recordId]);
                }
              }}
              handleRemove={() => {
                deleteFlashcards([displayOrder.recordId]);
              }}
              bulkAddMode={bulkAddMode}
              isSelected={bulkAddIds.includes(displayOrder.recordId)}
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
