import { useCallback, useState } from 'react';
import { useStudentFlashcards } from '../useStudentFlashcards';

export interface ExampleReviewedResults {
  exampleId: number;
  difficulty: 'easy' | 'hard';
  pending: boolean;
}

export interface UseSrsReturn {
  examplesReviewedResults: ExampleReviewedResults[];
  handleReviewExample: (exampleId: number, difficulty: 'easy' | 'hard') => void;
  hasExampleBeenReviewed: (exampleId: number) => 'easy' | 'hard' | null;
  isExampleReviewPending: (exampleId: number) => boolean;
}

export function useSrsFunctionality(): UseSrsReturn {
  const { updateFlashcardInterval } = useStudentFlashcards();

  const [examplesReviewedResults, setExamplesReviewedResults] = useState<
    ExampleReviewedResults[]
  >([]);

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

  const handleReviewExample = useCallback(
    async (exampleId: number, difficulty: 'easy' | 'hard') => {
      // Check if already reviewed before making API call
      if (hasExampleBeenReviewed(exampleId)) {
        console.error(
          'Flashcard has already been reviewed, this should not happen',
        );
        return;
      }

      try {
        markExampleAsReviewed(exampleId, difficulty, true);
        await updateFlashcardInterval(exampleId, difficulty);
        markExampleAsReviewed(exampleId, difficulty, false);
      } catch (error) {
        console.error('Failed to update flashcard interval:', error);
      }
    },
    [hasExampleBeenReviewed, markExampleAsReviewed, updateFlashcardInterval],
  );

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    isExampleReviewPending,
  };
}
