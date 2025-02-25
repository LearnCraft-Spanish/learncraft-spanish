import type { Flashcard } from 'src/types/interfaceDefinitions';

import React, { useCallback } from 'react';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';

interface QuizButtonsProps {
  currentExample: Flashcard;
  answerShowing: boolean;
  incrementExampleNumber: () => void;
}

export default function SRSQuizButtons({
  currentExample,
  answerShowing,
  incrementExampleNumber,
}: QuizButtonsProps) {
  const { flashcardDataQuery, updateFlashcardMutation } =
    useStudentFlashcards();

  const updateFlashcard = updateFlashcardMutation.mutate;

  const getStudentExampleFromExample = useCallback(
    (example: Flashcard) => {
      const relatedStudentExample =
        flashcardDataQuery.data?.studentExamples?.find(
          (item) => item.relatedExample === example.recordId,
        );
      if (!relatedStudentExample?.recordId) {
        return undefined;
      }
      return relatedStudentExample;
    },
    [flashcardDataQuery],
  );

  const getIntervalFromExample = useCallback(
    (example: Flashcard) => {
      const relatedStudentExample = getStudentExampleFromExample(example);
      if (relatedStudentExample === undefined) {
        return 0;
      } else if (relatedStudentExample.reviewInterval === null) {
        return 0;
      }
      const interval = relatedStudentExample.reviewInterval;
      return interval;
    },
    [getStudentExampleFromExample],
  );

  const updateFlashcardInterval = useCallback(
    async (difficulty: 'easy' | 'hard') => {
      const exampleId = currentExample?.recordId;
      const studentExampleId =
        getStudentExampleFromExample(currentExample)?.recordId;
      const currentInterval = getIntervalFromExample(currentExample);
      if (exampleId === undefined || studentExampleId === undefined) {
        return;
      }
      incrementExampleNumber();
      let newInterval;

      if (difficulty === 'easy') {
        newInterval = currentInterval + 1;
      } else {
        newInterval = currentInterval > 0 ? currentInterval - 1 : 0;
      }
      const updateStatus = updateFlashcard({
        studentExampleId,
        newInterval,
        difficulty,
      });
      return updateStatus;
    },
    [
      currentExample,
      getIntervalFromExample,
      getStudentExampleFromExample,
      incrementExampleNumber,
      updateFlashcard,
    ],
  );

  /* keyboard controlls */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'q' ||
        event.key === 'Q' ||
        event.key === ',' ||
        event.key === '<'
      ) {
        updateFlashcardInterval('hard');
      }
      if (
        event.key === 'e' ||
        event.key === 'E' ||
        event.key === '.' ||
        event.key === '>'
      ) {
        updateFlashcardInterval('easy');
      }
    },
    [updateFlashcardInterval],
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="buttonBox srsButtons">
      {flashcardDataQuery.isSuccess &&
        answerShowing &&
        !currentExample.difficulty && (
          <>
            <button
              type="button"
              className="redButton"
              onClick={() => updateFlashcardInterval('hard')}
            >
              This was hard
            </button>
            <button
              type="button"
              className="greenButton"
              onClick={() => updateFlashcardInterval('easy')}
            >
              This was easy
            </button>
          </>
        )}
      {currentExample.difficulty &&
        (currentExample.difficulty === 'hard' ? (
          <button type="button" className="hardBanner">
            Labeled: Hard
          </button>
        ) : (
          <button type="button" className="easyBanner">
            Labeled: Easy
          </button>
        ))}
    </div>
  );
}
