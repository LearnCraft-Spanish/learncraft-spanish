import { useCallback } from 'react';

import type { Flashcard } from '../../interfaceDefinitions';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import { useUserData } from '../../hooks/useUserData';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';

interface ExamplesTableProps {
  examplesToDisplay: Flashcard[];
  getExampleById: (recordId: number) => Flashcard | null | undefined;
  flashcardsFound: number;
  flashcardsFoundWithAudio: number;
  copyTable: () => void;
}
export default function ExamplesTable({
  examplesToDisplay,
  getExampleById,
  flashcardsFound,
  flashcardsFoundWithAudio,
  copyTable,
}: ExamplesTableProps) {
  const userDataQuery = useUserData();
  const studentRole = userDataQuery.data?.role ? userDataQuery.data.role : '';
  const isAdmin = userDataQuery.data?.isAdmin
    ? userDataQuery.data.isAdmin
    : false;
  const {
    flashcardDataQuery,
    exampleIsCollected,
    exampleIsPending,
    addFlashcardMutation,
    removeFlashcardMutation,
  } = useStudentFlashcards();

  // This can be refactored down! its an artifact of displayOrder I believe.
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

  const removeFlashcard = useCallback(
    (exampleId: string) => {
      removeFlashcardMutation.mutate(Number.parseInt(exampleId));
    },
    [removeFlashcardMutation],
  );
  const formatExampleForTable = useCallback(
    (example: Flashcard) => {
      if (
        (studentRole === 'student' && flashcardDataQuery.isSuccess) ||
        isAdmin
      ) {
        const isCollected = exampleIsCollected(example.recordId);
        const isPending = exampleIsPending(example.recordId);
        return (
          <div className="exampleCard" key={example.recordId}>
            <div className="exampleCardSpanishText">
              {formatSpanishText(example.spanglish, example.spanishExample)}
            </div>
            <div className="exampleCardEnglishText">
              {formatEnglishText(example.englishTranslation)}
            </div>
            {studentRole === 'student' && flashcardDataQuery.isSuccess && (
              <>
                {!isCollected && (
                  <button
                    type="button"
                    className="addButton"
                    value={example.recordId}
                    onClick={(e) => addFlashcard(e.currentTarget.value)}
                  >
                    Add
                  </button>
                )}
                {isCollected && isPending && (
                  <button
                    type="button"
                    className="pendingButton"
                    value={example.recordId}
                  >
                    Adding...
                  </button>
                )}
                {isCollected && !isPending && (
                  <button
                    type="button"
                    className="removeButton"
                    value={example.recordId}
                    onClick={(e) => removeFlashcard(e.currentTarget.value)}
                  >
                    Remove
                  </button>
                )}
              </>
            )}
          </div>
        );
      }
    },
    [
      addFlashcard,
      exampleIsCollected,
      exampleIsPending,
      flashcardDataQuery.isSuccess,
      isAdmin,
      removeFlashcard,
      studentRole,
    ],
  );
  return (
    <div className="examplesTable">
      <div className="buttonBox">
        <button type="button" onClick={copyTable}>
          Copy Table
        </button>
        <div className="displayExamplesDescription">
          <h4>
            {`${flashcardsFound} flashcards showing (
            ${flashcardsFoundWithAudio} with audio)`}
          </h4>
        </div>
      </div>
      <div id="examplesTableBody">
        {flashcardDataQuery.isError && <h2>Error Loading Flashcards</h2>}
        {examplesToDisplay.length > 0 &&
          examplesToDisplay.map((example) => formatExampleForTable(example))}
      </div>
    </div>
  );
}
