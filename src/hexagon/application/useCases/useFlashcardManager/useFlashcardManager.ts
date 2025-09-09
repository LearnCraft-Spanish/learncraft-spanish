import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';

import type { UsePaginationReturn } from '@application/units/Pagination/usePagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { Flashcard } from '@learncraft-spanish/shared';
import type { UseSkillTagSearchReturnType } from '../../units/useSkillTagSearch';
import { useCombinedFiltersWithVocabulary } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useFilteredOwnedFlashcards } from '@application/units/useFilteredOwnedFlashcards';
import useLessonPopup from '@application/units/useLessonPopup';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillTagSearch } from '../../units/useSkillTagSearch';

export interface UseFlashcardManagerReturn {
  filteredFlashcards: Flashcard[];
  paginationState: UsePaginationReturn;
  exampleFilter: UseCombinedFiltersWithVocabularyReturnType;

  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;

  findMore: () => void;
  lessonPopup: LessonPopup;
  skillTagSearch: UseSkillTagSearchReturnType;

  isLoading: boolean;
  error: Error | null;
}

export default function useFlashcardManager(): UseFlashcardManagerReturn {
  // This doesn't belong here. This is an interface responsibility.
  const navigate = useNavigate();

  const pageSize = 25;

  const {
    filteredFlashcards,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    isLoading,
    error,
  } = useFilteredOwnedFlashcards();

  const exampleFilter: UseCombinedFiltersWithVocabularyReturnType =
    useCombinedFiltersWithVocabulary();

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

  const skillTagSearch: UseSkillTagSearchReturnType = useSkillTagSearch();

  const { lessonPopup } = useLessonPopup();

  return {
    filteredFlashcards,
    paginationState,
    exampleFilter,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,

    // This doesn't belong here. This is an interface responsibility.
    findMore,
    lessonPopup,
    skillTagSearch,

    isLoading,
    error,
  };
}
