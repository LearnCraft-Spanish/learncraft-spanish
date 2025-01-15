import React, { useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import type {
  DisplayOrder,
  Flashcard,
  StudentExample,
} from '../types/interfaceDefinitions';
import Loading from '../components/Loading';
import { useStudentFlashcards } from '../hooks/useStudentFlashcards';
import ExamplesTable from '../components/FlashcardFinder/ExamplesTable';

function FlashcardManager() {
  const { flashcardDataQuery, exampleIsCustom } = useStudentFlashcards();
  const studentFlashcardData = flashcardDataQuery.data;

  const getStudentExampleFromExampleId = useCallback(
    (exampleId: number) => {
      const studentExample = studentFlashcardData?.studentExamples.find(
        (item) => item.relatedExample === exampleId,
      );

      return (
        studentExample ||
        ({
          recordId: -1,
          dateCreated: '',
          relatedExample: -1,
        } as StudentExample)
      );
    },
    [studentFlashcardData?.studentExamples],
  );

  const sortedExamples = useMemo(() => {
    const sortFunction = (a: Flashcard, b: Flashcard) => {
      const aStudentExample = getStudentExampleFromExampleId(a?.recordId);
      const bStudentExample = getStudentExampleFromExampleId(b?.recordId);
      const aDate = new Date(aStudentExample.dateCreated);
      const bDate = new Date(bStudentExample.dateCreated);
      if (exampleIsCustom(a.recordId) && !exampleIsCustom(b.recordId)) {
        return -1;
      } else if (!exampleIsCustom(a.recordId) && exampleIsCustom(b.recordId)) {
        return 1;
      } else if (a.spanglish === 'spanglish' && b.spanglish !== 'spanglish') {
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
    };
    return studentFlashcardData?.examples.sort(sortFunction);
  }, [
    studentFlashcardData?.examples,
    exampleIsCustom,
    getStudentExampleFromExampleId,
  ]);

  const displayOrder = useMemo(() => {
    if (!sortedExamples) {
      return [];
    }
    const newDisplayOrder: DisplayOrder[] = sortedExamples.map((example) => {
      return {
        recordId: example.recordId,
      };
    });
    return newDisplayOrder;
  }, [sortedExamples]);

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
            {studentFlashcardData?.examples && (
              <ExamplesTable
                dataSource={studentFlashcardData.examples}
                displayOrder={displayOrder}
                showSpanglishLabel
                sorted
              />
            )}
          </div>
        )}
    </>
  );
}

export default FlashcardManager;
