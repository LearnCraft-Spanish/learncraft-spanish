import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import { useStudentFlashcards } from '@application/queries/useStudentFlashcards';
import usePagination from '@application/units/usePagination';

import { useCallback, useEffect } from 'react';

import { Pagination } from 'src/components/Table/components';
import ExampleListItem from '../ExampleListItem/FlashcardFinderExampleListItem';
import {
  copyTableToClipboard,
  getExampleById as getExampleByIdFunction,
} from './units/functions';
import 'src/components/ExamplesTable/ExamplesTable.scss';

interface ExamplesTableProps {
  pageSize?: number;
  totalCount: number;
  dataSource: ExampleWithVocabulary[];
  displayOrder: DisplayOrder[];
}

export default function ExamplesTable({
  pageSize = 50,
  totalCount,
  dataSource,
  displayOrder,
}: ExamplesTableProps) {
  const {
    displayOrderSegment,
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
  } = usePagination({ displayOrder, itemsPerPage: pageSize });

  const { isExampleCollected, createFlashcards, deleteFlashcards } =
    useStudentFlashcards();

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

  return (
    <div className="examplesTable">
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
      {/* unnessessary id? */}
      <div id="examplesTableBody">
        {displayOrderSegment.map((displayOrder) => {
          return (
            <ExampleListItem
              key={displayOrder.recordId}
              example={getExampleById(displayOrder.recordId)}
              isCollected={isExampleCollected(displayOrder.recordId)}
              isPending={false}
              handleAdd={() => {
                createFlashcards([displayOrder.recordId]);
              }}
              handleRemove={() => {
                deleteFlashcards([displayOrder.recordId]);
              }}
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
