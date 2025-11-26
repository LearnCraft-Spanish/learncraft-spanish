import type { TextQuizComponentProps } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { useStudentFlashcardUpdates } from '@application/units/useTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { useEffect, useRef } from 'react';

export function SrsQuiz({
  showSrsButtons = true,
  ...textQuizProps
}: TextQuizComponentProps) {
  const {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
  } = useStudentFlashcardUpdates();

  // Store flushBatch in a ref to avoid recreating the effect on every render
  const flushBatchRef = useRef(flushBatch);
  flushBatchRef.current = flushBatch;

  // Flush batch when component unmounts (user leaves quiz early)
  useEffect(() => {
    return () => {
      void flushBatchRef.current();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return (
    <TextQuiz
      {...textQuizProps}
      showSrsButtons={showSrsButtons}
      srsQuizProps={{
        examplesReviewedResults,
        handleReviewExample,
        hasExampleBeenReviewed,
        flushBatch,
      }}
    />
  );
}
