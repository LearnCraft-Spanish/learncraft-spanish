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
  flushBatch: () => Promise<void>;
}

export function useStudentFlashcardUpdates(): UseStudentFlashcardUpdatesReturn {
  const { updateFlashcards, getFlashcardByExampleId } = useStudentFlashcards();
  const { isFlushing, setIsFlushing } = useIsFlushingStudentFlashcardUpdates();
  const {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  } = useStudentFlashcardUpdatesUtils();

  // store the examplesReviewedResults in the state for optomistic UI updates
  const [examplesReviewedResults, setExamplesReviewedResults] = useState<
    PendingFlashcardUpdateObject[]
  >([]);

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

  const addToBatch = useCallback(
    (exampleId: number, difficulty: SrsDifficulty) => {
      const newRecord: PendingFlashcardUpdateObject = {
        exampleId,
        difficulty,
        lastReviewedDate: new Date().toISOString().slice(0, 10),
      };

      const oldFlashcardUpdateObjects =
        getPendingFlashcardUpdateObjectsFromLocalStorage();

      // add the new record to the array, and remove the old record if it exists
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

  const handleReviewExample = useCallback(
    (exampleId: number, difficulty: SrsDifficulty) => {
      addToBatch(exampleId, difficulty);
    },
    [addToBatch],
  );

  const flushBatch = useCallback(async () => {
    const pendingFlashcardUpdateObjects =
      getPendingFlashcardUpdateObjectsFromLocalStorage();
    if (
      !pendingFlashcardUpdateObjects ||
      pendingFlashcardUpdateObjects.length === 0
    )
      return; // No need to flush if the batch is empty

    if (isFlushing) return; // No need to flush if we're already flushing

    setIsFlushing(true);
    const batchToFlush = [...pendingFlashcardUpdateObjects];
    setPendingFlashcardUpdateObjectsInLocalStorage([]);

    try {
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
    } catch (error) {
      console.error('[SRS Batching] Failed to flush batch update:', error);
      // On error, restore the batch to try again later
      setPendingFlashcardUpdateObjectsInLocalStorage(batchToFlush);
    } finally {
      setIsFlushing(false);
    }
  }, [
    isFlushing,
    setIsFlushing,
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
    updateFlashcards,
    getFlashcardByExampleId,
  ]);

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
  };
}
