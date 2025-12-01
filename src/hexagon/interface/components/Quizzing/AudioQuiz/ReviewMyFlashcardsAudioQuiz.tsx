import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import { useStudentFlashcardUpdates } from '@application/units/useTextQuiz';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { useEffect, useRef } from 'react';

export function ReviewMyFlashcardsAudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  const {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
  } = useStudentFlashcardUpdates();

  // Store flushBatch in a ref to avoid recreating the effect on every render
  const flushBatchRef = useRef(flushBatch);
  useEffect(() => {
    flushBatchRef.current = flushBatch;
  }, [flushBatch]);

  // Flush batch when component unmounts (user leaves quiz early)
  useEffect(() => {
    return () => {
      void flushBatchRef.current();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return (
    <AudioQuiz
      audioQuizProps={audioQuizProps}
      reviewMyFlashcardsProps={{
        examplesReviewedResults,
        handleReviewExample,
        hasExampleBeenReviewed,
        flushBatch,
      }}
    />
  );
}
