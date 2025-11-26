import { useStudentFlashcardUpdatesUtils } from '@application/units/studentFlashcardUpdates/utils';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useStudentFlashcardUpdates } from '@application/units/useTextQuiz/useStudentFlashcardUpdates';
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

  // const flushBatch = useCallback(async () => {
  //   const pendingFlashcardUpdateObjects =
  //     getPendingFlashcardUpdateObjectsFromLocalStorage();
  //   if (
  //     !pendingFlashcardUpdateObjects ||
  //     pendingFlashcardUpdateObjects.length === 0
  //   )
  //     return; // No need to flush if the batch is empty

  //   if (isFlushing) return; // No need to flush if we're already flushing

  //   setIsFlushing(true);
  //   const batchToFlush = [...pendingFlashcardUpdateObjects];
  //   setPendingFlashcardUpdateObjectsInLocalStorage([]);

  //   try {
  //     // Mark all as pending
  //     // batchToFlush.forEach(({ exampleId, difficulty }) => {
  //     //   markExampleAsReviewed(exampleId, difficulty, true);
  //     // });

  //     // Convert exampleId + difficulty to flashcard updates with intervals
  //     const updates = batchToFlush
  //       .map(({ exampleId, difficulty, lastReviewedDate }) => {
  //         const flashcard = getFlashcardByExampleId({ exampleId });
  //         if (!flashcard) {
  //           console.error(`Flashcard not found for example ID: ${exampleId}`);
  //           return null;
  //         }

  //         const newInterval = calculateNewSrsInterval(
  //           flashcard.interval ?? 0, // current interval
  //           difficulty,
  //         );

  //         return {
  //           flashcardId: flashcard.id,
  //           interval: newInterval,
  //           lastReviewedDate,
  //         };
  //       })
  //       .filter((update) => update !== null);

  //     // Send batch update to backend
  //     if (updates.length > 0) {
  //       await updateFlashcards(updates);
  //     }

  //     // Clear localStorage on successful flush
  //     setPendingFlashcardUpdateObjectsInLocalStorage([]);
  //   } catch (error) {
  //     console.error('[SRS Batching] Failed to flush batch update:', error);
  //     // On error, restore the batch to try again later
  //     setPendingFlashcardUpdateObjectsInLocalStorage(batchToFlush);
  //   } finally {
  //     setIsFlushing(false);
  //   }
  // }, [
  //   isFlushing,
  //   setIsFlushing,
  //   getPendingFlashcardUpdateObjectsFromLocalStorage,
  //   setPendingFlashcardUpdateObjectsInLocalStorage,
  //   updateFlashcards,
  //   getFlashcardByExampleId,
  // ]);

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
