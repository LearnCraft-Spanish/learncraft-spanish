import { useStudentFlashcardUpdates } from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates';
import { useStudentFlashcardUpdatesUtils } from '@application/units/studentFlashcardUpdates/utils';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useEffect, useRef } from 'react';

export function useFlushFlashcardUpdatesOnLoad() {
  const { flashcards, getFlashcardByExampleId } = useStudentFlashcards();

  const { flushBatch: flushStudentFlashcardUpdates } =
    useStudentFlashcardUpdates();
  const {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  } = useStudentFlashcardUpdatesUtils();

  // used to track if we've already attempted to flush on mount
  const hasAttemptedInitialFlushRef = useRef(false);

  // Auto-flush pending updates from localStorage on mount (after flashcards are loaded)
  useEffect(() => {
    if (!hasAttemptedInitialFlushRef.current && flashcards) {
      hasAttemptedInitialFlushRef.current = true;

      const storedUpdates = getPendingFlashcardUpdateObjectsFromLocalStorage();

      if (!storedUpdates || storedUpdates.length === 0) return;

      // Filter out updates that have already been synced
      // Compare localStorage updates with flashcard lastReviewed date
      const filteredUpdates = storedUpdates.filter(
        ({ exampleId, lastReviewedDate }) => {
          const flashcard = getFlashcardByExampleId({ exampleId });

          if (!flashcard) return false; // flashcard has been deleted, remove from batch

          // If flashcard has a lastReviewed date, compare it with our pending update date
          if (flashcard.lastReviewed) {
            // If flashcard's lastReviewed is same or more recent than our pending update,
            // the update has already been synced - remove from batch
            // TODO: Change to date.isoString DAY formay, make comparison actually work
            if (flashcard.lastReviewed >= lastReviewedDate) {
              return false;
            }
          }

          // Keep in batch - needs to be synced
          return true;
        },
      );

      // Update localStorage with filtered batch
      if (filteredUpdates.length > 0) {
        setPendingFlashcardUpdateObjectsInLocalStorage(filteredUpdates);
        // Try to flush remaining pending updates from previous session
        void flushStudentFlashcardUpdates();
      } else {
        // Nothing left to flush, clear localStorage
        setPendingFlashcardUpdateObjectsInLocalStorage([]);
      }
    }
  }, [
    flashcards,
    getFlashcardByExampleId,
    flushStudentFlashcardUpdates,
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  ]);
}
