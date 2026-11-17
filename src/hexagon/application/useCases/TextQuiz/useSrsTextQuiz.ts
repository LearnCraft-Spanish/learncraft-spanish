import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates';
import type {
  TextQuizReturn,
  UseTextQuizProps,
} from '@application/units/useTextQuiz';
import { useStudentFlashcardUpdates } from '@application/units/studentFlashcardUpdates';
import { useTextQuiz } from '@application/units/useTextQuiz/useTextQuiz';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const UNTRACKED_PROGRESS_MESSAGE =
  "SRS review progress isn't saved when using the app as another student.";

export function useSrsTextQuiz(textQuizProps: UseTextQuizProps): {
  TextQuizReturn: TextQuizReturn;
  srsQuizProps: UseStudentFlashcardUpdatesReturn;
} {
  const {
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
    examplesReviewedResults,
    isProgressTracked,
  } = useStudentFlashcardUpdates();
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  const { currentExample, nextExample, cleanupFunction, isQuizComplete } =
    useTextQuizReturn;

  // Tell coaches/admins once per quiz that their reviews aren't saved.
  // The ref keeps StrictMode's double effect run from showing it twice.
  const hasShownUntrackedNoticeRef = useRef(false);
  useEffect(() => {
    if (isProgressTracked || hasShownUntrackedNoticeRef.current) return;
    hasShownUntrackedNoticeRef.current = true;
    toast.info(UNTRACKED_PROGRESS_MESSAGE);
  }, [isProgressTracked]);

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
      isProgressTracked,
    },
  };
}
