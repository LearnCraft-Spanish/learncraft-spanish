import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example';
import type { Flashcard } from '@learncraft-spanish/shared/dist/domain/flashcard';
import useFilterOwnedFlashcards from '@application/coordinators/hooks/useFilterOwnedFlashcards';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { filterExamplesCombined } from '@learncraft-spanish/shared';
import { useMemo } from 'react';
import { useCombinedFiltersWithVocabulary } from './Filtering/useCombinedFiltersWithVocabulary';

export interface UseFilteredOwnedFlashcardsReturn {
  filteredFlashcards: Flashcard[];
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useFilteredOwnedFlashcards(): UseFilteredOwnedFlashcardsReturn {
  // The coordinator state to track whether owned filters are filtered
  const { filterOwnedFlashcards, setFilterOwnedFlashcards } =
    useFilterOwnedFlashcards();

  // The coordinator state to track the active filters
  const {
    selectedSkillTags,
    excludeSpanglish,
    audioOnly,
    lessonRangeVocabRequired,
    lessonVocabKnown,
  } = useCombinedFiltersWithVocabulary();

  // The owned flashcards to be filtered from the useStudentFlashcards hook
  const {
    flashcards,
    collectedExamples,
    isLoading,
    error,
  }: UseStudentFlashcardsReturn = useStudentFlashcards();

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
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    isLoading,
    error,
  };
}
