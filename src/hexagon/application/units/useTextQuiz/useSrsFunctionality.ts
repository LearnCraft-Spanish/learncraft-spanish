import { useCallback, useState } from 'react';
import { useStudentFlashcards } from '../useStudentFlashcards';

export interface ExampleReviewedResults {
  exampleId: number;
  difficulty: 'easy' | 'hard';
}

export interface UseSrsReturn {
  examplesReviewedResults: ExampleReviewedResults[];
  handleReviewExample: (exampleId: number, difficulty: 'easy' | 'hard') => void;
  hasExampleBeenReviewed: (exampleId: number) => 'easy' | 'hard' | null;
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

  const markExampleAsReviewed = useCallback(
    (exampleId: number, difficulty: 'easy' | 'hard') => {
      if (hasExampleBeenReviewed(exampleId)) {
        console.error(
          'Flashcard has already been reviewed, this should not happen',
        );
        return;
      }

      setExamplesReviewedResults([
        ...examplesReviewedResults,
        { exampleId, difficulty },
      ]);
    },
    [examplesReviewedResults, hasExampleBeenReviewed],
  );

  const handleReviewExample = useCallback(
    async (exampleId: number, difficulty: 'easy' | 'hard') => {
      try {
        await updateFlashcardInterval(exampleId, difficulty);
        markExampleAsReviewed(exampleId, difficulty);
      } catch (error) {
        console.error('Failed to update flashcard interval:', error);
      }
    },
    [markExampleAsReviewed, updateFlashcardInterval],
  );

  return {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
  };
}
