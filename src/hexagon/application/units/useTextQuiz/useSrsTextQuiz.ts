import type {
  TextQuizReturn,
  UseStudentFlashcardUpdatesReturn,
  UseTextQuizProps,
} from '@application/units/useTextQuiz';
import { useStudentFlashcardUpdates } from '@application/units/useTextQuiz/useStudentFlashcardUpdates';
import { useTextQuiz } from '@application/units/useTextQuiz/useTextQuiz';
import { useCallback, useEffect, useRef } from 'react';

export function useSrsTextQuiz(textQuizProps: UseTextQuizProps): {
  TextQuizReturn: TextQuizReturn;
  srsQuizProps: UseStudentFlashcardUpdatesReturn;
} {
  const {
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
    examplesReviewedResults,
  } = useStudentFlashcardUpdates();
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  const { currentExample, nextExample, cleanupFunction, isQuizComplete } =
    useTextQuizReturn;

  // make a ref to flushBatch
  const flushBatchRef = useRef(flushBatch);
  flushBatchRef.current = flushBatch;

  const enchancedNextExample = useCallback(() => {
    // If current example hasn't been reviewed, mark as viewed
    if (currentExample) {
      const hasBeenReviewed = hasExampleBeenReviewed(currentExample.id);
      if (!hasBeenReviewed) {
        handleReviewExample(currentExample.id, 'viewed');
      }
    }
    nextExample();
  }, [
    currentExample,
    hasExampleBeenReviewed,
    handleReviewExample,
    nextExample,
  ]);

  // Enhanced cleanup function that flushes reviewMyFlashcards batch before cleanup
  const enhancedCleanupFunction = useCallback(() => {
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

    // flush batch when component unmounts
    return () => {
      if (flushBatchRef.current) {
        flushBatchRef.current();
      }
    };
  }, [isQuizComplete]); // Only depend on isQuizComplete

  return {
    TextQuizReturn: {
      ...useTextQuizReturn,
      nextExample: enchancedNextExample,
      cleanupFunction: enhancedCleanupFunction,
    },
    srsQuizProps: {
      handleReviewExample,
      hasExampleBeenReviewed,
      flushBatch,
      examplesReviewedResults,
    },
  };
}
