import type { PendingFlashcardUpdateObject } from '@application/units/studentFlashcardUpdates/types';
import type { SrsDifficulty } from '@domain/srs';

import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useIsFlushingStudentFlashcardUpdates } from '@application/coordinators/hooks/useIsFlushingStudentFlashcardUpdates';
import { useStudentFlashcardUpdatesUtils } from '@application/units/studentFlashcardUpdates';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { calculateNewSrsInterval } from '@domain/srs';
import { useCallback, useState } from 'react';
export interface UseStudentFlashcardUpdatesReturn {
  examplesReviewedResults: PendingFlashcardUpdateObject[];
  handleReviewExample: (exampleId: number, difficulty: SrsDifficulty) => void;
  hasExampleBeenReviewed: (exampleId: number) => SrsDifficulty | null;
  flushBatch: () => Promise<void>;
  /**
   * True only when the logged-in user is the active student. When false
   * (a coach/admin using the app as another student), reviews are kept in
   * memory for this session and never saved.
   */
  isProgressTracked: boolean;
}

export function useStudentFlashcardUpdates(): UseStudentFlashcardUpdatesReturn {
  const { updateFlashcards, getFlashcardByExampleId } = useStudentFlashcards();
  const { appUser, isOwnUser } = useActiveStudent();
  const { isFlushing, setIsFlushing } = useIsFlushingStudentFlashcardUpdates();
  const {
    getPendingFlashcardUpdateObjectsFromLocalStorage,
    setPendingFlashcardUpdateObjectsInLocalStorage,
  } = useStudentFlashcardUpdatesUtils();

  // Only Students can have flashcards & flashcard updates, and progress is
  // only saved when the logged-in user is that student.
  const isProgressTracked = isOwnUser && appUser?.studentRole === 'student';

  // store the examplesReviewedResults in the state for optomistic UI updates
  const [examplesReviewedResults, setExamplesReviewedResults] = useState<
    PendingFlashcardUpdateObject[]
  >([]);

  const hasExampleBeenReviewed = useCallback(
    (exampleId: number) => {
      // Untracked reviews live only in state; tracked ones in localStorage
      const reviews = isProgressTracked
        ? getPendingFlashcardUpdateObjectsFromLocalStorage()
        : examplesReviewedResults;
      const flashcardUpdateObject = reviews?.find(
        (update) => update.exampleId === exampleId,
      );
      return flashcardUpdateObject?.difficulty ?? null;
    },
    [
      isProgressTracked,
      getPendingFlashcardUpdateObjectsFromLocalStorage,
      examplesReviewedResults,
    ],
  );

  // Record a review for this session only, without saving it anywhere
  const addToSessionOnly = useCallback(
    (exampleId: number, difficulty: SrsDifficulty) => {
      const newRecord: PendingFlashcardUpdateObject = {
        exampleId,
        difficulty,
        lastReviewedDate: new Date().toISOString().slice(0, 10),
      };
      setExamplesReviewedResults((previous) => [
        ...previous.filter((record) => record.exampleId !== exampleId),
        newRecord,
      ]);
    },
    [],
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
      if (!isProgressTracked) {
        addToSessionOnly(exampleId, difficulty);
        return;
      }
      addToBatch(exampleId, difficulty);
    },
    [addToBatch, addToSessionOnly, isProgressTracked],
  );

  const flushBatch = useCallback(async () => {
    if (!isProgressTracked) return; // Untracked reviews are never sent
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
          // Filter out updates that have already been synced
          // Compare flashcard lastReviewed date with localStorage update lastReviewedDate
          if (flashcard.lastReviewed) {
            const dateOnFlashcard = new Date(flashcard.lastReviewed);
            const dateOnPendingUpdate = new Date(lastReviewedDate);
            if (dateOnFlashcard >= dateOnPendingUpdate) {
              console.error(
                `Flashcard ${flashcard.id} has already been reviewed on ${dateOnFlashcard.toISOString()}.`,
              );
              return null;
            }
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
    isProgressTracked,
  ]);

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    flushBatch,
    isProgressTracked,
  };
}
