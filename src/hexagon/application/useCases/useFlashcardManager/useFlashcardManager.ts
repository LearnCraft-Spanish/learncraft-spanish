import type { UsePaginationReturn } from '@application/units/Pagination/usePagination';

import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';

import type { LessonPopup } from '@application/units/useLessonPopup';
import type { Flashcard } from '@learncraft-spanish/shared';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useExampleFilter } from '@application/units/useExampleFilter';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import useLessonPopup from '@application/units/useLessonPopup';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UseFlashcardManagerReturn {
  filteredFlashcards: Flashcard[];
  paginationState: UsePaginationReturn;
  filtersEnabled: boolean;
  exampleFilter: UseExampleFilterReturnType;

  toggleFilters: () => void;
  findMore: () => void;
  lessonPopup: LessonPopup;

  isLoading: boolean;
  isLoadingPartial: boolean;
  error: Error | null;
  errorPartial: Error | null;
}

export default function useFlashcardManager(): UseFlashcardManagerReturn {
  // This doesn't belong here. This is an interface responsibility.
  const navigate = useNavigate();

  const pageSize = 25;

  const {
    filteredFlashcards,
    filtersEnabled,
    setFiltersEnabled,
    isLoading,
    isLoadingPartial,
    error,
    errorPartial,
  } = useFilteredOwnedFlashcards();

  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();

  // Simple callback to navigate to the flashcard finder
  // This doesn't belong here. This is an interface responsibility.
  const findMore = useCallback(() => {
    navigate('/flashcardfinder', { replace: true });
  }, [navigate]);

  // We use this to randomize the flashcard order for display
  const displayOrder = useMemo(() => {
    if (!filteredFlashcards) {
      return [];
    }

    return filteredFlashcards.map((flashcard) => ({
      recordId: flashcard.id,
    }));
  }, [filteredFlashcards]);

  // We use this to paginate the flashcards
  const paginationState = usePagination({
    itemsPerPage: pageSize,
    displayOrder,
  });

  const { lessonPopup } = useLessonPopup();

  return {
    filteredFlashcards,
    paginationState,
    filtersEnabled,
    exampleFilter,
    toggleFilters: () => setFiltersEnabled(!filtersEnabled),

    // This doesn't belong here. This is an interface responsibility.
    findMore,
    lessonPopup,

    isLoading,
    isLoadingPartial,
    error,
    errorPartial,
  };
}
