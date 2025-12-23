import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { ExampleFiltersWithVocabulary } from '@learncraft-spanish/shared';
import {
  useLessonRangeVocabRequired,
  useLessonVocabKnown,
} from '@application/queries/useLessonWithVocab';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useMemo } from 'react';

export interface UseCombinedFiltersWithVocabularyReturnType extends UseCombinedFiltersReturnType {
  filterStateWithVocabulary: ExampleFiltersWithVocabulary;
  lessonRangeVocabRequired: number[] | undefined;
  lessonVocabKnown: number[] | undefined;
}

export function useCombinedFiltersWithVocabulary(): UseCombinedFiltersWithVocabularyReturnType {
  const combinedFilterHook = useCombinedFilters({});

  // Destructure only the properties we need locally
  const {
    courseId,
    fromLessonNumber,
    toLessonNumber,
    isLoading: isLoadingCombinedFilters,
    error: errorCombinedFilters,
  } = combinedFilterHook;

  // The vocab required for the from lesson
  const {
    lessonRangeVocabRequired,
    isLoading: isLoadingFromLessonVocabRequired,
    error: errorFromLessonVocabRequired,
  } = useLessonRangeVocabRequired(
    // Pass the selected course id and from and to lesson numbers
    courseId ?? null,
    fromLessonNumber ?? null,
    toLessonNumber ?? null,
  );

  // The vocab known for the to lesson
  const {
    lessonVocabKnown,
    isLoading: isLoadingToLessonVocabKnown,
    error: errorToLessonVocabKnown,
  } = useLessonVocabKnown(
    // Pass the selected course id and to lesson number
    courseId ?? null,
    toLessonNumber ?? null,
  );

  // filter state with vocabulary
  const filterStateWithVocabulary: ExampleFiltersWithVocabulary =
    useMemo(() => {
      return {
        ...combinedFilterHook.filterState,
        requiredVocabulary: fromLessonNumber
          ? lessonRangeVocabRequired
          : undefined,
        allowedVocabulary: lessonVocabKnown ?? [],
      };
    }, [
      combinedFilterHook.filterState,
      fromLessonNumber,
      lessonRangeVocabRequired,
      lessonVocabKnown,
    ]);

  // combined loading states
  const isLoading = useMemo(() => {
    return (
      isLoadingFromLessonVocabRequired ||
      isLoadingToLessonVocabKnown ||
      isLoadingCombinedFilters
    );
  }, [
    isLoadingFromLessonVocabRequired,
    isLoadingCombinedFilters,
    isLoadingToLessonVocabKnown,
  ]);

  // combined error states
  const error = useMemo(() => {
    return (
      errorFromLessonVocabRequired ||
      errorToLessonVocabKnown ||
      errorCombinedFilters
    );
  }, [
    errorFromLessonVocabRequired,
    errorCombinedFilters,
    errorToLessonVocabKnown,
  ]);

  return {
    filterStateWithVocabulary,
    // Spread the combined filter hook
    ...combinedFilterHook,

    // Return the lesson range and lesson vocabulary properties
    lessonRangeVocabRequired,
    lessonVocabKnown,

    // Load state for the full hook
    isLoading,
    error,
  };
}
