import type { UseCombinedFiltersWithVocabularyReturnType } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useCombinedFiltersWithVocabulary } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { filterExamplesCombined } from '@learncraft-spanish/shared';
import { useMemo } from 'react';

export interface UseFilterOwnedFlashcardsReturn {
  filteredFlashcards: Flashcard[];
  /**
   * The combined-filter subscription this hook already owns. Exposed so a page
   * use case can hand the very same instance to a presentational filter section
   * instead of subscribing to `useCombinedFilters` a second time.
   */
  combinedFilters: UseCombinedFiltersWithVocabularyReturnType;
  /**
   * The owned-flashcards subscription this hook already owns. Exposed so a page
   * use case can hand the very same instance to its table and menus instead of
   * subscribing to `useStudentFlashcards` a second time.
   */
  flashcardsQuery: UseStudentFlashcardsReturn;
  studentFlashcardsLoading: boolean;
  filteredFlashcardsLoading: boolean;
  error: Error | null;
}

export function useFilterOwnedFlashcards(
  filterOwnedFlashcards: boolean,
): UseFilterOwnedFlashcardsReturn {
  // The coordinator state to track the active filters
  const combinedFilters: UseCombinedFiltersWithVocabularyReturnType =
    useCombinedFiltersWithVocabulary();
  const {
    selectedSkillTags,
    excludeSpanglish,
    audioOnly,
    lessonRangeVocabRequired,
    lessonVocabKnown,
    isLoading: isLoadingCombinedFiltersWithVocabulary,
  } = combinedFilters;

  // The owned flashcards to be filtered from the useStudentFlashcards hook
  const flashcardsQuery: UseStudentFlashcardsReturn = useStudentFlashcards();
  const { flashcards, collectedExamples, isLoading, error } = flashcardsQuery;

  const filteredFlashcards = useMemo(() => {
    if (!filterOwnedFlashcards) {
      return flashcards ?? [];
    }

    const filteredExamples: ExampleWithVocabulary[] = filterExamplesCombined(
      collectedExamples ?? [],
      {
        allowedVocabulary: lessonVocabKnown,
        requiredVocabulary: lessonRangeVocabRequired,
        excludeSpanglish,
        audioOnly,
        skillTags: selectedSkillTags,
      },
    );

    const flashcardsMapped: Flashcard[] =
      flashcards?.filter((flashcard) =>
        filteredExamples.some((example) => example.id === flashcard.example.id),
      ) ?? [];

    return flashcardsMapped;
  }, [
    collectedExamples,
    lessonVocabKnown,
    lessonRangeVocabRequired,
    excludeSpanglish,
    audioOnly,
    selectedSkillTags,
    flashcards,
    filterOwnedFlashcards,
  ]);

  return {
    filteredFlashcards,
    combinedFilters,
    flashcardsQuery,
    studentFlashcardsLoading: isLoading,
    filteredFlashcardsLoading: isLoadingCombinedFiltersWithVocabulary,
    error,
  };
}
