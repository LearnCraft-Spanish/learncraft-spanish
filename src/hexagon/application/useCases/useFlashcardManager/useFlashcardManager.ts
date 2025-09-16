import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useFilterOwnedFlashcards } from '@application/units/Filtering/useFilterOwnedFlashcards';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import { useCallback, useMemo, useState } from 'react';

export interface UseFlashcardManagerReturn {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;

  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  onGoingToQuiz: () => void;

  isLoading: boolean;
  error: Error | null;
}

export default function useFlashcardManager({
  enableFilteringByDefault,
}: {
  enableFilteringByDefault: boolean;
}): UseFlashcardManagerReturn {
  // Arbitrary definition
  const PAGE_SIZE = 25;

  // Local state for filtering owned flashcards
  const [filterOwnedFlashcards, setFilterOwnedFlashcards] = useState(
    enableFilteringByDefault,
  );

  // This is the principal hook for this use case
  const { filteredFlashcards, isLoading, error } = useFilterOwnedFlashcards(
    filterOwnedFlashcards,
  );

  // We use this to paginate the flashcards
  const paginationState = usePagination({
    itemsPerPage: PAGE_SIZE,
    totalItems: filteredFlashcards.length,
  });

  // We display only the flashcards that are in the current page
  const displayFlashcards = useMemo(() => {
    return filteredFlashcards.slice(
      paginationState.startIndex,
      paginationState.endIndex,
    );
  }, [filteredFlashcards, paginationState]);

  const onGoingToQuiz = useCallback(() => {
    setFilterOwnedFlashcards(true);
  }, []);

  return {
    allFlashcards: filteredFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    onGoingToQuiz,
    isLoading,
    error,
  };
}
