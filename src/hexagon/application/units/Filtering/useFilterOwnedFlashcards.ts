import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { UseStudentFlashcardsReturn } from '../useStudentFlashcards';
import { filterExamplesCombined } from '@learncraft-spanish/shared';
import { useMemo } from 'react';
import { useStudentFlashcards } from '../useStudentFlashcards';
import { useCombinedFiltersWithVocabulary } from './useCombinedFiltersWithVocabulary';

export interface UseFilterOwnedFlashcardsReturn {
  filteredFlashcards: Flashcard[];
  studentFlashcardsLoading: boolean;
  filteredFlashcardsLoading: boolean;
  error: Error | null;
}

export function useFilterOwnedFlashcards(
  filterOwnedFlashcards: boolean,
): UseFilterOwnedFlashcardsReturn {
  // The coordinator state to track the active filters
  const {
    selectedSkillTags,
    excludeSpanglish,
    audioOnly,
    lessonRangeVocabRequired,
    lessonVocabKnown,
    isLoading: isLoadingCombinedFiltersWithVocabulary,
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
    studentFlashcardsLoading: isLoading,
    filteredFlashcardsLoading: isLoadingCombinedFiltersWithVocabulary,
    error,
  };
}
