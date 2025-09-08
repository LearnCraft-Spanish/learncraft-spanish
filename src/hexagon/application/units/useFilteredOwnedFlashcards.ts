import type { ExampleWithVocabulary } from '@learncraft-spanish/shared/dist/domain/example';
import type { Flashcard } from '@learncraft-spanish/shared/dist/domain/flashcard';
import type { UseExampleFilterReturnType } from './useExampleFilter';
import type { UseStudentFlashcardsReturn } from './useStudentFlashcards';
import { filterExamplesCombined } from '@learncraft-spanish/shared';
import { useCallback, useMemo } from 'react';
import useFilterOwnedFlashcards from '../coordinators/hooks/useFilterOwnedFlashcards';
import {
  useLessonRangeVocabRequired,
  useLessonVocabKnown,
} from '../queries/useLessonWithVocab';
import { useExampleFilter } from './useExampleFilter';
import { useStudentFlashcards } from './useStudentFlashcards';

export function useFilteredOwnedFlashcards() {
  // The coordinator state to track whether owned filters are filtered
  const { filterOwnedFlashcards, setFilterOwnedFlashcards } =
    useFilterOwnedFlashcards();

  // A simple callback to toggle the filter owned flashcards state
  const setFiltersEnabled = useCallback(
    (b: boolean) => {
      setFilterOwnedFlashcards(b);
    },
    [setFilterOwnedFlashcards],
  );

  // The coordinator state to track the active filters
  const exampleFilter: UseExampleFilterReturnType = useExampleFilter();
  const { courseAndLessonState, filterState: coordinatorFilterState } =
    exampleFilter;

  // Access the active filters from the coordinator
  const { filterState } = coordinatorFilterState;

  // The owned flashcards to be filtered from the useStudentFlashcards hook
  const {
    flashcards,
    collectedExamples,
    isLoading,
    error,
  }: UseStudentFlashcardsReturn = useStudentFlashcards();

  // Separate query to get required vocabulary for the from lesson if selected
  const {
    lessonRangeVocabRequired,
    isLoading: fromLessonWithVocabLoading,
    error: fromLessonWithVocabError,
  } = useLessonRangeVocabRequired(
    courseAndLessonState.course?.id,
    courseAndLessonState.fromLesson?.lessonNumber,
    courseAndLessonState.toLesson?.lessonNumber,
    filterOwnedFlashcards,
  );

  // Simple array memo for easy reference
  const fromLessonVocabIds: number[] | undefined = useMemo(() => {
    return lessonRangeVocabRequired;
  }, [lessonRangeVocabRequired]);

  // Separate query to get known vocabulary for the to lesson
  const {
    lessonVocabKnown,
    isLoading: toLessonWithVocabLoading,
    error: toLessonWithVocabError,
  } = useLessonVocabKnown(
    courseAndLessonState.course?.id,
    courseAndLessonState.toLesson?.lessonNumber,
    filterOwnedFlashcards,
  );

  const isLoadingPartial = useMemo(() => {
    return fromLessonWithVocabLoading || toLessonWithVocabLoading;
  }, [fromLessonWithVocabLoading, toLessonWithVocabLoading]);

  const errorPartial = useMemo(() => {
    return fromLessonWithVocabError || toLessonWithVocabError;
  }, [fromLessonWithVocabError, toLessonWithVocabError]);

  // Simple array memo for easy reference
  const toLessonVocabIds: number[] = useMemo(() => {
    return lessonVocabKnown ?? [];
  }, [lessonVocabKnown]);

  const filteredFlashcards = useMemo(() => {
    if (!filterOwnedFlashcards) {
      return flashcards ?? [];
    }

    const filteredExamples: ExampleWithVocabulary[] = filterExamplesCombined(
      collectedExamples ?? [],
      {
        allowedVocabulary: toLessonVocabIds,
        requiredVocabulary: fromLessonVocabIds,
        excludeSpanglish: filterState.excludeSpanglish,
        audioOnly: filterState.audioOnly,
        skillTags: filterState.skillTags,
      },
    );

    const flashcardsMapped: Flashcard[] =
      flashcards?.filter((flashcard) =>
        filteredExamples.some((example) => example.id === flashcard.example.id),
      ) ?? [];

    return flashcardsMapped;
  }, [
    collectedExamples,
    fromLessonVocabIds,
    toLessonVocabIds,
    filterState,
    flashcards,
    filterOwnedFlashcards,
  ]);

  return {
    filteredFlashcards,
    setFiltersEnabled,
    filtersEnabled: filterOwnedFlashcards,

    isLoading,
    error,
    isLoadingPartial,
    errorPartial,
  };
}
