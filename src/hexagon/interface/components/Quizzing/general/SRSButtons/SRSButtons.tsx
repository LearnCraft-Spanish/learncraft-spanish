import type { SrsDifficulty } from '@domain/srs';
import React, { useCallback } from 'react';
import './SRSButtons.scss';

interface SRSButtonsProps {
  answerShowing: boolean;
  incrementExampleNumber: () => void;
  hasExampleBeenReviewed: SrsDifficulty | null;
  handleReviewExample: (difficulty: SrsDifficulty) => void;
}

export function SRSButtons({
  hasExampleBeenReviewed,
  handleReviewExample,
  answerShowing,
  incrementExampleNumber,
}: SRSButtonsProps) {
  const handleReviewAndIncrementExample = useCallback(
    (difficulty: SrsDifficulty) => {
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
        handleReviewAndIncrementExample('hard' as SrsDifficulty);
      }
      if (
        event.key === 'e' ||
        event.key === 'E' ||
        event.key === '.' ||
        event.key === '>'
      ) {
        handleReviewAndIncrementExample('easy' as SrsDifficulty);
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
    <>
      {hasExampleBeenReviewed && hasExampleBeenReviewed !== 'viewed' && (
        <div className="buttonBox srsButtons">
          {hasExampleBeenReviewed === 'hard' ? (
            <button type="button" className="hardBanner">
              Labeled: Hard
            </button>
          ) : (
            <button type="button" className="easyBanner">
              Labeled: Easy
            </button>
          )}
        </div>
      )}
      <div className="buttonBox srsButtons">
        {answerShowing &&
          (hasExampleBeenReviewed === 'viewed' || !hasExampleBeenReviewed) && (
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
        {hasExampleBeenReviewed && hasExampleBeenReviewed !== 'viewed' && (
          <>
            <button
              type="button"
              className="greenButton"
              disabled={hasExampleBeenReviewed === 'easy'}
              onClick={() => handleReviewExample('easy')}
            >
              Update to easy
            </button>

            <button
              type="button"
              className="redButton"
              disabled={hasExampleBeenReviewed === 'hard'}
              onClick={() => handleReviewExample('hard')}
            >
              Update to hard
            </button>
          </>
        )}
      </div>
    </>
  );
}
