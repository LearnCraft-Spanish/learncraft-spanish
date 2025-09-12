import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { Flashcard } from '@learncraft-spanish/shared';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import { useMemo } from 'react';

export interface UseFlashcardManagerReturn {
  allFlashcards: Flashcard[];
  displayFlashcards: Flashcard[];
  paginationState: PaginationState;

  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;

  isLoading: boolean;
  error: Error | null;
}

export default function useFlashcardManager(): UseFlashcardManagerReturn {
  // Arbitrary definition
  const PAGE_SIZE = 25;

  // This is the principal hook for this use case
  const {
    filteredFlashcards,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    isLoading,
    error,
  } = useFilteredOwnedFlashcards();

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

  return {
    allFlashcards: filteredFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    isLoading,
    error,
  };
}
