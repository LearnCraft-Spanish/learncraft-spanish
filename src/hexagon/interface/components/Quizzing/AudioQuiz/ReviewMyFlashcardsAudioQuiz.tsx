import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import { useAudioQuiz } from '@application/units/AudioQuiz/useAudioQuiz';
import { useStudentFlashcardUpdates } from '@application/units/studentFlashcardUpdates';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { useCallback, useEffect, useRef } from 'react';
export function ReviewMyFlashcardsAudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  const { handleReviewExample, hasExampleBeenReviewed, flushBatch } =
    useStudentFlashcardUpdates();
  const audioQuizReturn = useAudioQuiz(audioQuizProps);
  const {
    currentExample,
    nextExample,
    cleanupFunction,
    isQuizComplete,
    nextStep,
    currentStepValue,
  } = audioQuizReturn;
  // Store flushBatch in a ref to avoid recreating the effect on every render
  const flushBatchRef = useRef(flushBatch);
  flushBatchRef.current = flushBatch;

  // REVIEW MY FLASHCARDS FUNCTIONALITY
  // Audio quizzes automatically mark all viewed examples as "viewed" to update lastReviewedDate
  // Unlike text quizzes, audio quizzes don't show easy/hard rating buttons

  // Wrap nextExample to mark as viewed if not reviewed
  const enchancedNextExample = useCallback(() => {
    // If reviewMyFlashcards quiz and current example hasn't been reviewed, mark as viewed
    if (hasExampleBeenReviewed && currentExample) {
      const hasBeenReviewed = hasExampleBeenReviewed(currentExample.id);
      if (!hasBeenReviewed) {
        handleReviewExample(currentExample.id, 'viewed');
      }
    }
    nextExample();
  }, [
    nextExample,
    currentExample,
    hasExampleBeenReviewed,
    handleReviewExample,
  ]);

  const enchancedNextStep = useCallback(() => {
    if (currentStepValue?.step === 'answer') {
      if (hasExampleBeenReviewed && currentExample) {
        const hasBeenReviewed = hasExampleBeenReviewed(currentExample.id);
        if (!hasBeenReviewed) {
          handleReviewExample(currentExample.id, 'viewed');
        }
      }
    }
    nextStep();
  }, [
    nextStep,
    currentStepValue,
    currentExample,
    hasExampleBeenReviewed,
    handleReviewExample,
  ]);

  // Enhanced cleanup function that flushes reviewMyFlashcards batch before cleanup
  const enhancedCleanupFunction = useCallback(async () => {
    if (flushBatchRef.current) {
      flushBatchRef.current();
    }
    if (cleanupFunction) {
      cleanupFunction();
    }
  }, [cleanupFunction]);

  // Flush batch when quiz completes
  useEffect(() => {
    if (isQuizComplete && flushBatchRef.current) {
      flushBatchRef.current();
    }
  }, [isQuizComplete]);

  // Flush batch when component unmounts (user leaves quiz early)
  useEffect(() => {
    return () => {
      flushBatchRef.current();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return (
    <AudioQuiz
      audioQuizReturn={{
        ...audioQuizReturn,
        nextExample: enchancedNextExample,
        cleanupFunction: enhancedCleanupFunction,
        nextStep: enchancedNextStep,
      }}
      // reviewMyFlashcardsProps={{
      //   examplesReviewedResults,
      //   handleReviewExample,
      //   hasExampleBeenReviewed,
      //   flushBatch,
      // }}
    />
  );
}
