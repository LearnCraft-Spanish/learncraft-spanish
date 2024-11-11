import { useCallback, useEffect, useState } from 'react';

import type { DisplayOrder, Flashcard } from '../../interfaceDefinitions';
import { useActiveStudent } from '../../hooks/useActiveStudent';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';

import Loading from '../Loading';
import ExampleListItem from './ExampleListItem';
import Pagination from './Pagination';

interface ExamplesTableProps {
  dataSource: Flashcard[];
  displayOrder: DisplayOrder[];
  sorted?: boolean;
}

const ExamplesTable: React.FC<ExamplesTableProps> = ({
  dataSource,
  displayOrder,
}: ExamplesTableProps) => {
  const {
    flashcardDataQuery,
    addFlashcardMutation,
    removeFlashcardMutation,
    exampleIsCollected,
    exampleIsPending,
    exampleIsCustom,
  } = useStudentFlashcards();
  const { activeStudentQuery } = useActiveStudent();
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const maxPage = Math.ceil(displayOrder.length / itemsPerPage);

  const dataError = flashcardDataQuery.isError || activeStudentQuery.isError;
  const dataLoading =
    !dataError &&
    (flashcardDataQuery.isLoading || activeStudentQuery.isLoading);
  const dataReady =
    flashcardDataQuery.isSuccess && activeStudentQuery.isSuccess;
  const dataUnavailable =
    !(displayOrder.length > 0) && !dataLoading && !dataError;

  const isStudent = activeStudentQuery.data?.role === 'student';

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

  const filterByHasAudio = useCallback(
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
    [getExampleById],
  );

  const displayExamplesWithAudio =
    displayOrder.filter(filterByHasAudio)?.length || 0;

  const addFlashcard = useCallback(
    (exampleId: string) => {
      const exampleToUpdate = getExampleById(Number.parseInt(exampleId));
      if (!exampleToUpdate) {
        console.error('No example found with id: ', exampleId);
        return;
      }
      addFlashcardMutation.mutate(exampleToUpdate);
    },
    [addFlashcardMutation, getExampleById],
  );

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

  const removeFlashcard = useCallback(
    (exampleId: string) => {
      removeFlashcardMutation.mutate(Number.parseInt(exampleId));
    },
    [removeFlashcardMutation],
  );

  useEffect(() => {
    setPage(1);
  }, [displayOrder]);

  return (
    <>
      {dataError && <h2>Error Loading Flashcards</h2>}
      {dataLoading && <Loading message={'Loading Flashcards...'} />}
      {dataReady && (
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
          {dataUnavailable && <h2>No flashcards found</h2>}
          {!dataUnavailable && (
            <div id="examplesTableBody">
              {flashcardDataQuery.isError && <h2>Error Loading Flashcards</h2>}
              {flashcardDataQuery.isSuccess &&
                displayOrderSegment.map((displayOrder) => {
                  const id = displayOrder.recordId;
                  const exampleData = getExampleById(id);
                  if (!exampleData) {
                    return null;
                  } else
                    return (
                      <ExampleListItem
                        key={displayOrder.recordId}
                        data={exampleData}
                        addFlashcard={addFlashcard}
                        removeFlashcard={removeFlashcard}
                        isStudent={isStudent}
                        isCollected={exampleIsCollected(id)}
                        isPending={exampleIsPending(id)}
                        isCustom={exampleIsCustom(id)}
                      />
                    );
                })}
            </div>
          )}
        </div>
      )}
      <Pagination
        page={page}
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </>
  );
};

export default ExamplesTable;
