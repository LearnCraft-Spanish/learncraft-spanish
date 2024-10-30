import React from 'react';
import { Navigate } from 'react-router-dom';
import type { Flashcard, StudentExample } from './interfaceDefinitions';
import Loading from './components/Loading';
import {
  formatEnglishText,
  formatSpanishText,
} from './functions/formatFlashcardText';
import { useStudentFlashcards } from './hooks/useStudentFlashcards';

function FlashcardManager() {
  const { flashcardDataQuery, removeFlashcardMutation } =
    useStudentFlashcards();
  const studentFlashcardData = flashcardDataQuery.data;
  const removeFlashcard = removeFlashcardMutation.mutate;

  async function removeAndUpdate(recordId: number | string) {
    if (typeof recordId === 'string') {
      recordId = Number.parseInt(recordId);
    }
    removeFlashcard(recordId);
  }

  function getStudentExampleFromExampleId(exampleId: number) {
    const studentExample = studentFlashcardData?.studentExamples.find(
      (item) => item.relatedExample === exampleId,
    );

    return (
      studentExample ||
      ({ recordId: -1, dateCreated: '', relatedExample: -1 } as StudentExample)
    );
  }

  function createDisplayExamplesTable(tableToDisplay: Flashcard[]) {
    const sortedExamples = tableToDisplay.sort((a, b) => {
      const aStudentExample = getStudentExampleFromExampleId(a?.recordId);
      const bStudentExample = getStudentExampleFromExampleId(b?.recordId);
      const aDate = new Date(aStudentExample.dateCreated);
      const bDate = new Date(bStudentExample.dateCreated);
      if (a.spanglish === 'spanglish' && b.spanglish !== 'spanglish') {
        return -1;
      } else if (a.spanglish !== 'spanglish' && b.spanglish === 'spanglish') {
        return 1;
      } else if (aDate > bDate) {
        return -1;
      } else if (aDate < bDate) {
        return 1;
      } else {
        return 0;
      }
    });

    const finalTable = sortedExamples.map((item) => (
      <div className="exampleCard" key={item.recordId}>
        <div className="exampleCardSpanishText">
          {formatSpanishText(item.spanglish, item.spanishExample)}
        </div>
        <div className="exampleCardEnglishText">
          {formatEnglishText(item.englishTranslation)}
        </div>
        {item.spanglish === 'spanglish' && (
          <div className="spanglishLabel">
            <h4>Spanglish</h4>
          </div>
        )}
        {item.spanglish !== 'spanglish' && (
          <div className="spanishLabel">
            <h4>Spanish</h4>
          </div>
        )}
        {getStudentExampleFromExampleId(item.recordId)?.coachAdded ? (
          <div className="label customLabel">
            <h4>Custom</h4>
          </div>
        ) : (
          <button
            type="button"
            className="redButton"
            value={item.recordId}
            onClick={(e) =>
              removeAndUpdate(
                Number.parseInt((e.target as HTMLButtonElement).value),
              )
            }
          >
            Remove
          </button>
        )}
      </div>
    ));
    return finalTable;
  }

  return (
    <>
      {flashcardDataQuery.isLoading && (
        <Loading message="Loading Flashcards..." />
      )}
      {flashcardDataQuery.isError && <h2>Error Loading Flashcards</h2>}
      {flashcardDataQuery.isSuccess &&
        !flashcardDataQuery.data?.studentExamples?.length && (
          <Navigate to="/" />
        )}
      {flashcardDataQuery.isSuccess &&
        !!flashcardDataQuery.data?.examples?.length && (
          <div>
            <h2>Flashcard Manager</h2>
            <h4>
              {`Total flashcards: ${studentFlashcardData?.examples.length}`}
            </h4>
            {studentFlashcardData?.examples && (
              <div className="exampleCardContainer">
                {createDisplayExamplesTable(studentFlashcardData?.examples)}
              </div>
            )}
          </div>
        )}
    </>
  );
}

export default FlashcardManager;
