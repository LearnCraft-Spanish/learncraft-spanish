import type { ExampleFiltersWithVocabulary } from '@learncraft-spanish/shared';
import type { UseCombinedFiltersReturnType } from './useCombinedFilters';
import {
  useLessonRangeVocabRequired,
  useLessonVocabKnown,
} from '@application/queries/useLessonWithVocab';
import { useMemo } from 'react';
import { useCombinedFilters } from './useCombinedFilters';

export interface UseCombinedFiltersWithVocabularyReturnType
  extends UseCombinedFiltersReturnType {
  combinedFilterStateWithVocabulary: ExampleFiltersWithVocabulary;
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

  // combined filter state with vocabulary
  const combinedFilterStateWithVocabulary: ExampleFiltersWithVocabulary =
    useMemo(() => {
      return {
        ...combinedFilterHook.combinedFilterState,
        requiredVocabulary: fromLessonNumber
          ? lessonRangeVocabRequired
          : undefined,
        allowedVocabulary: lessonVocabKnown ?? [],
      };
    }, [
      combinedFilterHook.combinedFilterState,
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
    combinedFilterStateWithVocabulary,
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
