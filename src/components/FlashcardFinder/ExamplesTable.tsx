import { useCallback } from 'react';

import type { Flashcard } from '../../interfaceDefinitions';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';

interface ExamplesTableProps {
  examplesToDisplay: Flashcard[];
  studentRole: string;
  dataReady: boolean;
  getExampleById: (recordId: number) => Flashcard | null | undefined;
}
interface formatExampleForTableProps {
  example: Flashcard;
  exampleIsCollected: boolean;
  exampleIsPending: boolean;
}
export default function ExamplesTable({
  examplesToDisplay,
  studentRole,
  dataReady,
  getExampleById,
}: ExamplesTableProps) {
  const {
    flashcardDataQuery,
    exampleIsCollected,
    exampleIsPending,
    addFlashcardMutation,
    removeFlashcardMutation,
  } = useStudentFlashcards();

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
    ({
      example,
      exampleIsCollected,
      exampleIsPending,
    }: formatExampleForTableProps) => {
      return (
        <div className="exampleCard" key={example.recordId}>
          <div className="exampleCardSpanishText">
            {formatSpanishText(example.spanglish, example.spanishExample)}
          </div>
          <div className="exampleCardEnglishText">
            {formatEnglishText(example.englishTranslation)}
          </div>
          {studentRole === 'student' && dataReady && (
            <>
              {!exampleIsCollected && (
                <button
                  type="button"
                  className="addButton"
                  value={example.recordId}
                  onClick={(e) => addFlashcard(e.currentTarget.value)}
                >
                  Add
                </button>
              )}
              {exampleIsCollected && exampleIsPending && (
                <button
                  type="button"
                  className="pendingButton"
                  value={example.recordId}
                >
                  Adding...
                </button>
              )}
              {exampleIsCollected && !exampleIsPending && (
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
    },
    [addFlashcard, dataReady, removeFlashcard, studentRole],
  );
  return (
    <div id="examplesTableBody">
      {flashcardDataQuery.isError && <h2>Error Loading Flashcards</h2>}
      {flashcardDataQuery.isSuccess &&
        examplesToDisplay.map((example) =>
          formatExampleForTable({
            example,
            exampleIsCollected: exampleIsCollected(example.recordId),
            exampleIsPending: exampleIsPending(example.recordId),
          }),
        )}
    </div>
  );
}
