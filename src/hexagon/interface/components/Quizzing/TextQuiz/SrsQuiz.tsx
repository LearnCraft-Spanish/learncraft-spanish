import type { TextQuizComponentProps } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { useSrsFunctionality } from '@application/units/useTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { useEffect, useRef } from 'react';

export function SrsQuiz(textQuizProps: TextQuizComponentProps) {
  const {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    isExampleReviewPending,
    flushBatch,
  } = useSrsFunctionality();

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
      srsQuizProps={{
        examplesReviewedResults,
        handleReviewExample,
        hasExampleBeenReviewed,
        isExampleReviewPending,
        flushBatch,
      }}
    />
  );
}
