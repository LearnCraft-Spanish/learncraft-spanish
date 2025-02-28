import type { DisplayOrder, Flashcard } from 'src/types/interfaceDefinitions';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ExampleListItem from './ExampleListItem';
import Pagination from './Pagination';

interface ExamplesTableProps {
  dataSource: Flashcard[];
  displayOrder: DisplayOrder[];
  showSpanglishLabel?: boolean;
  forceShowVocab?: boolean;
  selectFunction?: (recordId: number) => void;
  sorted?: boolean;
}

const ExamplesTable: React.FC<ExamplesTableProps> = ({
  dataSource,
  displayOrder,
  showSpanglishLabel = false,
  sorted = false,
  forceShowVocab = false,
  selectFunction = undefined,
}: ExamplesTableProps) => {
  const [page, setPage] = useState(1);
  const [selectedExampleId, setSelectedExampleId] = useState<number | null>(
    null,
  );
  const itemsPerPage = 50;
  const maxPage = Math.ceil(displayOrder.length / itemsPerPage);

  const displayOrderSegment = displayOrder.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const nextPage = useCallback(() => {
    if (page >= maxPage) {
      return;
    }
    setPage(page + 1);
  }, [page, maxPage]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
  }, [page]);

  const selectExample = useMemo(() => {
    if (selectFunction) {
      return (recordId: number) => {
        selectFunction(recordId);
        setSelectedExampleId(recordId);
      };
    }
    return undefined;
  }, [selectFunction]);

  const getExampleById = useCallback(
    (recordId: number) => {
      const foundExample = dataSource.find(
        (example) => example.recordId === recordId,
      );
      if (!foundExample?.recordId) {
        console.error('No example found with id: ', recordId);
        return null;
      }
      return foundExample;
    },
    [dataSource],
  );

  const displayExamplesWithAudio = useMemo(() => {
    const audioExamples = displayOrder.filter(
      (displayOrderItem: DisplayOrder) => {
        const example = getExampleById(displayOrderItem.recordId);
        if (example?.spanishAudioLa) {
          if (example.spanishAudioLa.length > 0) {
            return true;
          }
          return false;
        }
        return false;
      },
    );
    return audioExamples?.length || 0;
  }, [displayOrder, getExampleById]);

  // called when user clicks 'Copy as Table' button
  // copies sentences in a table format to be pasted into a google doc or excel sheet
  function copyTable() {
    if (!displayOrder.length) {
      return null;
    }
    const headers = 'ID\tSpanish\tEnglish\tAudio_Link\n';
    const table = displayOrder
      .map((displayOrderObject) => {
        const foundExample = getExampleById(displayOrderObject.recordId);
        if (!foundExample) {
          return '';
        }
        return `${foundExample.recordId}\t\
            ${foundExample.spanishExample}\t\
            ${foundExample.englishTranslation}\t\
            ${foundExample.spanishAudioLa}\n`;
      })
      .join('');

    const copiedText = headers + table;
    navigator.clipboard.writeText(copiedText);
  }

  useEffect(() => {
    if (!sorted || maxPage === 1) {
      setPage(1);
    }
  }, [displayOrder, sorted, maxPage]);

  return (
    <div className="examplesTable">
      <div className="buttonBox">
        <button type="button" onClick={copyTable}>
          Copy Table
        </button>
        <div className="displayExamplesDescription">
          <h4>
            {`${displayOrder.length} flashcards showing (
                ${displayExamplesWithAudio} with audio)`}
          </h4>
        </div>
      </div>
      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <div id="examplesTableBody">
        {displayOrderSegment.map((displayOrder) => {
          const id = displayOrder.recordId;
          const exampleData = getExampleById(id);
          if (!exampleData) {
            return null;
          } else
            return (
              <ExampleListItem
                key={displayOrder.recordId}
                data={exampleData}
                showSpanglishLabel={showSpanglishLabel}
                forceShowVocab={forceShowVocab}
                selectExample={selectExample}
                selectedExampleId={selectedExampleId}
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
};

export default ExamplesTable;
