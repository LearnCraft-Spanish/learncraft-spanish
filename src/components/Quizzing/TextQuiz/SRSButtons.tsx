import React, { useCallback } from 'react';

import type { Flashcard } from '../../../interfaceDefinitions';
import { useStudentFlashcards } from '../../../hooks/useStudentFlashcards';

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

  const flashcardData = flashcardDataQuery.data;
  const updateFlashcard = updateFlashcardMutation.mutate;

  const getStudentExampleFromExample = useCallback(
    (example: Flashcard) => {
      const relatedStudentExample = flashcardData?.studentExamples?.find(
        (item) => item.relatedExample === example.recordId,
      );
      if (!relatedStudentExample?.recordId) {
        return undefined;
      }
      return relatedStudentExample;
    },
    [flashcardData],
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

  const increaseDifficulty = useCallback(async () => {
    const exampleId = currentExample?.recordId;
    const studentExampleId =
      getStudentExampleFromExample(currentExample)?.recordId;
    const currentInterval = getIntervalFromExample(currentExample);
    if (exampleId === undefined || studentExampleId === undefined) {
      return;
    }
    incrementExampleNumber();
    const newInterval = currentInterval > 0 ? currentInterval - 1 : 0;
    const updateStatus = updateFlashcard({
      studentExampleId,
      newInterval,
      difficulty: 'hard',
    });
    return updateStatus;
  }, [
    currentExample,
    getIntervalFromExample,
    getStudentExampleFromExample,
    incrementExampleNumber,
    updateFlashcard,
  ]);

  const decreaseDifficulty = useCallback(async () => {
    const exampleId = currentExample?.recordId;
    const studentExampleId =
      getStudentExampleFromExample(currentExample)?.recordId;
    const currentInterval = getIntervalFromExample(currentExample);
    if (exampleId === undefined || studentExampleId === undefined) {
      return;
    }
    incrementExampleNumber();
    const newInterval = currentInterval + 1;
    const updateStatus = updateFlashcard({
      studentExampleId,
      newInterval,
      difficulty: 'easy',
    });
    return updateStatus;
  }, [
    currentExample,
    getIntervalFromExample,
    getStudentExampleFromExample,
    incrementExampleNumber,
    updateFlashcard,
  ]);

  /* keyboard controlls */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'q' ||
        event.key === 'Q' ||
        event.key === ',' ||
        event.key === '<'
      ) {
        increaseDifficulty();
      }
      if (
        event.key === 'e' ||
        event.key === 'E' ||
        event.key === '.' ||
        event.key === '>'
      ) {
        decreaseDifficulty();
      }
    },
    [increaseDifficulty, decreaseDifficulty],
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="buttonBox srsButtons">
      {answerShowing && !currentExample.difficulty && (
        <>
          <button
            type="button"
            className="redButton"
            onClick={increaseDifficulty}
          >
            This was hard
          </button>
          <button
            type="button"
            className="greenButton"
            onClick={decreaseDifficulty}
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
