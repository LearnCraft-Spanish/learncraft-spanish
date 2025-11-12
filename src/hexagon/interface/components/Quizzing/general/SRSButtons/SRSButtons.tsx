import React, { useCallback } from 'react';
import '@interface/components/Quizzing/general/SRSButtons/SRSButtons.scss';

interface SRSButtonsProps {
  answerShowing: boolean;
  incrementExampleNumber: () => void;
  hasExampleBeenReviewed: 'easy' | 'hard' | null;
  handleReviewExample: (difficulty: 'easy' | 'hard') => void;
  isExampleReviewPending: boolean;
}

export function SRSButtons({
  hasExampleBeenReviewed,
  handleReviewExample,
  answerShowing,
  incrementExampleNumber,
  isExampleReviewPending,
}: SRSButtonsProps) {
  const handleReviewAndIncrementExample = useCallback(
    (difficulty: 'easy' | 'hard') => {
      incrementExampleNumber();
      handleReviewExample(difficulty);
    },
    [handleReviewExample, incrementExampleNumber],
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
        handleReviewAndIncrementExample('hard');
      }
      if (
        event.key === 'e' ||
        event.key === 'E' ||
        event.key === '.' ||
        event.key === '>'
      ) {
        handleReviewAndIncrementExample('easy');
      }
    },
    [handleReviewAndIncrementExample],
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="buttonBox srsButtons">
      {answerShowing && !hasExampleBeenReviewed && !isExampleReviewPending && (
        <>
          <button
            type="button"
            className="redButton"
            onClick={() => handleReviewAndIncrementExample('hard')}
          >
            This was hard
          </button>
          <button
            type="button"
            className="greenButton"
            onClick={() => handleReviewAndIncrementExample('easy')}
          >
            This was easy
          </button>
        </>
      )}
      {(hasExampleBeenReviewed || isExampleReviewPending) &&
        (hasExampleBeenReviewed === 'hard' ? (
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
