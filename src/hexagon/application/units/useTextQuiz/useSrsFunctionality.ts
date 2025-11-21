import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { calculateNewSrsInterval } from '@domain/srs';
import { useCallback, useRef, useState } from 'react';

const BATCH_SIZE = 10;

export interface ExampleReviewedResults {
  exampleId: number;
  difficulty: 'easy' | 'hard';
  pending: boolean;
}

interface PendingBatchUpdate {
  exampleId: number;
  difficulty: 'easy' | 'hard';
}

export interface UseSrsReturn {
  examplesReviewedResults: ExampleReviewedResults[];
  handleReviewExample: (exampleId: number, difficulty: 'easy' | 'hard') => void;
  hasExampleBeenReviewed: (exampleId: number) => 'easy' | 'hard' | null;
  isExampleReviewPending: (exampleId: number) => boolean;
  flushBatch: () => Promise<void>;
}

export function useSrsFunctionality(): UseSrsReturn {
  const { flashcards, updateFlashcards } = useStudentFlashcards();

  const [examplesReviewedResults, setExamplesReviewedResults] = useState<
    ExampleReviewedResults[]
  >([]);

  // Batch pending updates - using ref to avoid stale closure issues
  const pendingBatchRef = useRef<PendingBatchUpdate[]>([]);
  const [isFlushing, setIsFlushing] = useState(false);

  const hasExampleBeenReviewed = useCallback(
    (exampleId: number) => {
      const result = examplesReviewedResults.find(
        (result) => result.exampleId === exampleId,
      );
      if (result) {
        return result.difficulty;
      }
      return null;
    },
    [examplesReviewedResults],
  );

  const isExampleReviewPending = useCallback(
    (exampleId: number) => {
      const example = examplesReviewedResults.find(
        (result) => result.exampleId === exampleId,
      );
      return example?.pending ?? false;
    },
    [examplesReviewedResults],
  );

  const markExampleAsReviewed = useCallback(
    (exampleId: number, difficulty: 'easy' | 'hard', pending: boolean) => {
      setExamplesReviewedResults((prev) => {
        // find example if its already in the array
        const example = prev.find((result) => result.exampleId === exampleId);
        if (example) {
          // update example with new difficulty and pending
          example.difficulty = difficulty;
          example.pending = pending;
          return [...prev];
        } else {
          return [...prev, { exampleId, difficulty, pending }];
        }
      });
    },
    [],
  );

  const flushBatch = useCallback(async () => {
    if (pendingBatchRef.current.length === 0) {
      // No need to flush if the batch is empty
      return;
    }

    if (isFlushing) {
      // No need to flush if we're already flushing
      return;
    }

    setIsFlushing(true);
    const batchToFlush = [...pendingBatchRef.current];
    pendingBatchRef.current = [];

    try {
      // Mark all as pending
      batchToFlush.forEach(({ exampleId, difficulty }) => {
        markExampleAsReviewed(exampleId, difficulty, true);
      });

      // Convert exampleId + difficulty to flashcard updates with intervals
      const updates = batchToFlush
        .map(({ exampleId, difficulty }) => {
          const flashcard = flashcards?.find(
            (fc) => fc.example.id === exampleId,
          );
          if (!flashcard) {
            console.error(`Flashcard not found for example ID: ${exampleId}`);
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
            lastReviewedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD UTC format
          };
        })
        .filter((update) => update !== null);

      // Send batch update to backend
      if (updates.length > 0) {
        await updateFlashcards(updates);
      }

      // Mark all as complete
      batchToFlush.forEach(({ exampleId, difficulty }) => {
        markExampleAsReviewed(exampleId, difficulty, false);
      });
    } catch (error) {
      console.error('[SRS Batching] Failed to flush batch update:', error);
      // On error, mark all as not pending but keep the difficulty
      batchToFlush.forEach(({ exampleId, difficulty }) => {
        markExampleAsReviewed(exampleId, difficulty, false);
      });
    } finally {
      setIsFlushing(false);
    }
  }, [isFlushing, markExampleAsReviewed, updateFlashcards, flashcards]);

  const addToBatch = useCallback(
    (exampleId: number, difficulty: 'easy' | 'hard') => {
      // Check if this example is already in the batch and update it
      const existingIndex = pendingBatchRef.current.findIndex(
        (update) => update.exampleId === exampleId,
      );

      if (existingIndex !== -1) {
        // Update existing entry in batch
        pendingBatchRef.current[existingIndex] = { exampleId, difficulty };
      } else {
        // Add new entry to batch
        pendingBatchRef.current.push({ exampleId, difficulty });
      }

      // Mark as reviewed locally (optimistic update)
      markExampleAsReviewed(exampleId, difficulty, false);

      // If we've reached the batch size, flush immediately
      if (pendingBatchRef.current.length >= BATCH_SIZE) {
        // Batch size reached, auto-flush
        void flushBatch();
      }
    },
    [flushBatch, markExampleAsReviewed],
  );

  const handleReviewExample = useCallback(
    (exampleId: number, difficulty: 'easy' | 'hard') => {
      // Check if already reviewed before adding to batch
      if (hasExampleBeenReviewed(exampleId)) {
        console.error(
          'Flashcard has already been reviewed, this should not happen',
        );
        return;
      }

      addToBatch(exampleId, difficulty);
    },
    [addToBatch, hasExampleBeenReviewed],
  );

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    isExampleReviewPending,
    flushBatch,
  };
}
