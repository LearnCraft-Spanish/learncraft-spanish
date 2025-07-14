import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import type { DisplayOrder } from 'src/types/interfaceDefinitions';
import usePagination from '@application/units/usePagination';
import { useCallback, useEffect, useState } from 'react';

import { Pagination } from 'src/components/Table/components';

import {
  copyTableToClipboard,
  getExampleById as getExampleByIdFunction,
} from './units/functions';
import 'src/components/ExamplesTable/ExamplesTable.scss';

interface ExamplesTableProps<T = any> {
  pageSize?: number;
  totalCount: number;
  dataSource: ExampleWithVocabulary[];
  displayOrder: DisplayOrder[];
  ExampleListItemProps: (example: ExampleWithVocabulary) => T;
  ExampleListItemComponent: React.ComponentType<T>;
}

export default function ExamplesTable<T = any>({
  pageSize = 50,
  totalCount,
  dataSource,
  displayOrder,
  ExampleListItemProps,
  ExampleListItemComponent,
}: ExamplesTableProps<T>) {
  console.log('totalCount', totalCount);
  console.log('pageSize', pageSize);
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(
    null,
  );
  const {
    displayOrderSegment,
    page,
    maxPage,
    nextPage,
    previousPage,
    setPage,
  } = usePagination({ displayOrder, itemsPerPage: pageSize });

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
          const id = displayOrder.recordId;
          const exampleData = getExampleById(id);
          if (!exampleData) {
            return null;
          } else
            return (
              <ExampleListItemComponent
                key={displayOrder.recordId}
                {...ExampleListItemProps(exampleData)}
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
