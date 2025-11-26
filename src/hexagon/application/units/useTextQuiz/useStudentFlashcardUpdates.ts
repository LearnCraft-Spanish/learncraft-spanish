import type { PendingFlashcardUpdateObject } from '@application/units/studentFlashcardUpdates/types';
import type { SrsDifficulty } from '@domain/srs';

import { useIsFlushingStudentFlashcardUpdates } from '@application/coordinators/hooks/useIsFlushingStudentFlashcardUpdates';
import { useStudentFlashcardUpdatesUtils } from '@application/units/studentFlashcardUpdates/utils';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { calculateNewSrsInterval } from '@domain/srs';
import { useCallback, useState } from 'react';
export interface UseStudentFlashcardUpdatesReturn {
  examplesReviewedResults: PendingFlashcardUpdateObject[];
  handleReviewExample: (exampleId: number, difficulty: SrsDifficulty) => void;
  hasExampleBeenReviewed: (exampleId: number) => SrsDifficulty | null;
  // isExampleReviewPending: (exampleId: number) => boolean;
  flushBatch: () => Promise<void>;
}

export function useStudentFlashcardUpdates(): UseStudentFlashcardUpdatesReturn {
  const { updateFlashcards, getFlashcardByExampleId } = useStudentFlashcards();
  const {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  } = useStudentFlashcardUpdatesUtils();
  const [examplesReviewedResults, setExamplesReviewedResults] = useState<
    PendingFlashcardUpdateObject[]
  >([]);

  // Batch pending updates - using ref to avoid stale closure issues
  // const pendingBatchRef = useRef<PendingFlashcardUpdateObject[]>([]);
  // const [isFlushing, setIsFlushing] = useState(false);
  const { isFlushing, setIsFlushing } = useIsFlushingStudentFlashcardUpdates();

  // Load pending updates from localStorage on mount
  // useEffect(() => {
  //   const storedUpdates = getPendingFlashcardUpdateObjectsFromLocalStorage();
  //   if (storedUpdates) {
  //     pendingBatchRef.current = storedUpdates;
  //   }
  // }, [getPendingFlashcardUpdateObjectsFromLocalStorage]); // will never update

  // Track if we've already tried to flush on mount
  // const hasAttemptedInitialFlush = useRef(false);

  const hasExampleBeenReviewed = useCallback(
    (exampleId: number) => {
      // get the flashcard update object from the localStorage
      const flashcardUpdateObject =
        getPendingFlashcardUpdateObjectsFromLocalStorage()?.find(
          (update) => update.exampleId === exampleId,
        );
      return flashcardUpdateObject?.difficulty ?? null;
    },
    [getPendingFlashcardUpdateObjectsFromLocalStorage],
  );

  // const isExampleReviewPending = useCallback(
  //   (exampleId: number) => {
  //     const flashcardUpdateObject = getPendingFlashcardUpdateObjectsFromLocalStorage()?.find(
  //       (update) => update.exampleId === exampleId,
  //     );
  //     return flashcardUpdateObject?.pending ?? false;
  //   },
  //   [getPendingFlashcardUpdateObjectsFromLocalStorage],
  // );

  const addToBatch = useCallback(
    (exampleId: number, difficulty: SrsDifficulty) => {
      const newRecord: PendingFlashcardUpdateObject = {
        exampleId,
        difficulty,
        lastReviewedDate: new Date().toISOString().slice(0, 10),
      };

      const oldFlashcardUpdateObjects =
        getPendingFlashcardUpdateObjectsFromLocalStorage();

      const newFlashcardUpdateObjects = [
        ...(oldFlashcardUpdateObjects?.filter(
          (record) => record.exampleId !== exampleId,
        ) ?? []),
        newRecord,
      ];

      setPendingFlashcardUpdateObjectsInLocalStorage(newFlashcardUpdateObjects);
      setExamplesReviewedResults(newFlashcardUpdateObjects);
    },
    [
      getPendingFlashcardUpdateObjectsFromLocalStorage,
      setPendingFlashcardUpdateObjectsInLocalStorage,
    ],
  );

  const flushBatch = useCallback(async () => {
    const pendingFlashcardUpdateObjects =
      getPendingFlashcardUpdateObjectsFromLocalStorage();
    if (
      !pendingFlashcardUpdateObjects ||
      pendingFlashcardUpdateObjects?.length === 0
    ) {
      // No need to flush if the batch is empty
      return;
    }

    if (isFlushing) {
      // No need to flush if we're already flushing
      return;
    }

    setIsFlushing(true);
    const batchToFlush = [...pendingFlashcardUpdateObjects];
    setPendingFlashcardUpdateObjectsInLocalStorage([]);

    try {
      // Mark all as pending
      // batchToFlush.forEach(({ exampleId, difficulty }) => {
      //   markExampleAsReviewed(exampleId, difficulty, true);
      // });

      // Convert exampleId + difficulty to flashcard updates with intervals
      const updates = batchToFlush
        .map(({ exampleId, difficulty, lastReviewedDate }) => {
          const flashcard = getFlashcardByExampleId({ exampleId });
          if (!flashcard) {
            console.error(`Flashcard not found for example ID: ${exampleId}`);
            return null;
          }

          const newInterval = calculateNewSrsInterval(
            flashcard.interval ?? 0, // current interval
            difficulty,
          );

          return {
            flashcardId: flashcard.id,
            interval: newInterval,
            lastReviewedDate,
          };
        })
        .filter((update) => update !== null);

      // Send batch update to backend
      if (updates.length > 0) {
        await updateFlashcards(updates);
      }

      // Mark all as complete
      // batchToFlush.forEach(({ exampleId, difficulty }) => {
      //   markExampleAsReviewed(exampleId, difficulty, false);
      // });

      // Clear localStorage on successful flush
      setPendingFlashcardUpdateObjectsInLocalStorage([]);
    } catch (error) {
      console.error('[SRS Batching] Failed to flush batch update:', error);
      // On error, restore the batch to try again later
      setPendingFlashcardUpdateObjectsInLocalStorage(batchToFlush);
      // Mark all as not pending but keep the difficulty
      // batchToFlush.forEach(({ exampleId, difficulty }) => {
      //   markExampleAsReviewed(exampleId, difficulty, false);
      // });
    } finally {
      setIsFlushing(false);
    }
  }, [
    isFlushing,
    setIsFlushing,
    // markExampleAsReviewed,
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
    updateFlashcards,
    getFlashcardByExampleId,
  ]);

  // const addToBatch = useCallback(
  //   (exampleId: number, difficulty: SrsDifficulty) => {
  //     const currentFlashcardUpdateObjects = getPendingFlashcardUpdateObjectsFromLocalStorage();
  //     // Get current date in YYYY-MM-DD format
  //     const lastReviewedDate = new Date().toISOString().slice(0, 10);

  //     // Check if this example is already in the batch and update it
  //     const existingIndex = pendingBatchRef.current.findIndex(
  //       (update) => update.exampleId === exampleId,
  //     );

  //     if (existingIndex !== -1) {
  //       // Update existing entry in batch with new difficulty and date
  //       pendingBatchRef.current[existingIndex] = {
  //         exampleId,
  //         difficulty,
  //         lastReviewedDate,
  //       };
  //     } else {
  //       // Add new entry to batch
  //       pendingBatchRef.current.push({
  //         exampleId,
  //         difficulty,
  //         lastReviewedDate,
  //       });
  //     }

  //     // Save updated batch to localStorage
  //     localStorage.setItem(PENDING_UPDATES_KEY, pendingBatchRef.current);

  //     // Mark as reviewed locally (optimistic update)
  //     markExampleAsReviewed(exampleId, difficulty, false);

  //     // If we've reached the batch size, flush immediately
  //     if (pendingBatchRef.current.length >= BATCH_SIZE) {
  //       // Batch size reached, auto-flush
  //       void flushBatch();
  //     }
  //   },
  //   [flushBatch, markExampleAsReviewed, localStorage],
  // );

  const handleReviewExample = useCallback(
    (exampleId: number, difficulty: SrsDifficulty) => {
      addToBatch(exampleId, difficulty);
    },
    [addToBatch],
  );

  // // Auto-flush pending updates from localStorage on mount (after flashcards are loaded)
  // useEffect(() => {
  //   if (
  //     flashcards &&
  //     pendingBatchRef.current.length > 0 &&
  //     !hasAttemptedInitialFlush.current
  //   ) {
  //     hasAttemptedInitialFlush.current = true;

  //     // Filter out updates that have already been synced
  //     // Compare localStorage updates with flashcard lastReviewed date
  //     const filteredUpdates = pendingBatchRef.current.filter(
  //       ({ exampleId, lastReviewedDate }) => {
  //         const flashcard = flashcards.find(
  //           (fc) => fc.example.id === exampleId,
  //         );

  //         if (!flashcard) {
  //           // Keep in batch - we'll handle missing flashcards in flushBatch
  //           return true;
  //         }

  //         // If flashcard has a lastReviewed date, compare it with our pending update date
  //         if (flashcard.lastReviewed) {
  //           const flashcardDate = flashcard.lastReviewed; // YYYY-MM-DD format

  //           // If flashcard's lastReviewed is same or more recent than our pending update,
  //           // the update has already been synced - remove from batch
  //           if (flashcardDate >= lastReviewedDate) {
  //             return false;
  //           }
  //         }

  //         // Keep in batch - needs to be synced
  //         return true;
  //       },
  //     );

  //     // Update the batch with filtered updates
  //     pendingBatchRef.current = filteredUpdates;

  //     // Update localStorage with filtered batch
  //     if (filteredUpdates.length > 0) {
  //       localStorage.setItem(PENDING_UPDATES_KEY, filteredUpdates);
  //       // Try to flush remaining pending updates from previous session
  //       void flushBatch();
  //     } else {
  //       // Nothing left to flush, clear localStorage
  //       localStorage.removeItem(PENDING_UPDATES_KEY);
  //     }
  //   }
  // }, [flashcards, flushBatch, localStorage]);

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    // isExampleReviewPending,
    flushBatch,
  };
}
