import type { PendingBatchUpdate } from '@application/units/useTextQuiz/useFlashcardTracking';
import { LocalStorageAdapter } from '@application/adapters/localStorageAdapter';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { calculateNewSrsInterval, PENDING_UPDATES_KEY } from '@domain/srs';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useFlushFlashcardUpdatesOnLoad() {
  const { flashcards, updateFlashcards, getFlashcardByExampleId } =
    useStudentFlashcards();
  const localStorage = LocalStorageAdapter();
  const hasAttemptedInitialFlush = useRef(false);
  const [isFlushing, setIsFlushing] = useState(false);

  const flushPendingUpdates = useCallback(
    async (updates: PendingBatchUpdate[]) => {
      if (updates.length === 0 || isFlushing) {
        return;
      }

      setIsFlushing(true);

      try {
        // Convert pending updates to flashcard interval commands
        const flashcardUpdates = updates
          .map(({ exampleId, difficulty }) => {
            const flashcard = getFlashcardByExampleId({ exampleId });
            if (!flashcard) {
              console.error(
                `[Flush on Load] Flashcard not found for example ID: ${exampleId}`,
              );
              return null;
            }

            // Calculate new interval using SRS algorithm
            const currentInterval = flashcard.interval ?? 0;
            const newInterval = calculateNewSrsInterval(
              currentInterval,
              difficulty,
            );

            return {
              flashcardId: flashcard.id,
              interval: newInterval,
              lastReviewedDate: new Date().toISOString().slice(0, 10),
            };
          })
          .filter((update) => update !== null);

        // Send batch update to backend
        if (flashcardUpdates.length > 0) {
          await updateFlashcards(flashcardUpdates);
        }

        // Clear localStorage on successful flush
        localStorage.removeItem(PENDING_UPDATES_KEY);
      } catch (error) {
        console.error(
          '[Flush on Load] Failed to flush pending updates:',
          error,
        );
        // Keep updates in localStorage for next attempt
      } finally {
        setIsFlushing(false);
      }
    },
    [getFlashcardByExampleId, updateFlashcards, localStorage, isFlushing],
  );

  // Auto-flush pending updates from localStorage on mount (after flashcards are loaded)
  useEffect(() => {
    if (!hasAttemptedInitialFlush.current && flashcards) {
      hasAttemptedInitialFlush.current = true;

      const storedUpdates =
        localStorage.getItem<PendingBatchUpdate[]>(PENDING_UPDATES_KEY);

      if (!storedUpdates || !Array.isArray(storedUpdates)) {
        return;
      }

      if (storedUpdates.length === 0) {
        return;
      }

      // Filter out updates that have already been synced
      // Compare localStorage updates with flashcard lastReviewed date
      const filteredUpdates = storedUpdates.filter(
        ({ exampleId, lastReviewedDate }) => {
          const flashcard = getFlashcardByExampleId({ exampleId });

          if (!flashcard) {
            // Keep in batch - we'll handle missing flashcards in flushPendingUpdates
            return true;
          }

          // If flashcard has a lastReviewed date, compare it with our pending update date
          if (flashcard.lastReviewed) {
            const flashcardDate = flashcard.lastReviewed; // YYYY-MM-DD format

            // If flashcard's lastReviewed is same or more recent than our pending update,
            // the update has already been synced - remove from batch
            if (flashcardDate >= lastReviewedDate) {
              return false;
            }
          }

          // Keep in batch - needs to be synced
          return true;
        },
      );

      // Update localStorage with filtered batch
      if (filteredUpdates.length > 0) {
        localStorage.setItem(PENDING_UPDATES_KEY, filteredUpdates);
        // Try to flush remaining pending updates from previous session
        void flushPendingUpdates(filteredUpdates);
      } else {
        // Nothing left to flush, clear localStorage
        localStorage.removeItem(PENDING_UPDATES_KEY);
      }
    }
  }, [flashcards, getFlashcardByExampleId, localStorage, flushPendingUpdates]);
}
