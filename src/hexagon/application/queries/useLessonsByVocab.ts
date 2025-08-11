import type { Lesson } from '@learncraft-spanish/shared';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseLessonsByVocabularyResult {
  lessonsByVocabulary: Lesson[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage subcategories.
 * This is a unit hook with a single responsibility that can be composed into different use cases.
 */
export function useLessonsByVocabulary(
  vocabId: number | null,
): UseLessonsByVocabularyResult {
  // Create adapter - infrastructure is now composed internally
  const { getLessonsByVocabulary } = useCourseAdapter();

  // Use TanStack Query to fetch and cache subcategories
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lessonsByVocabulary', vocabId],
    queryFn: () => getLessonsByVocabulary(vocabId!),
    enabled: vocabId !== null && vocabId > 0,
    ...queryDefaults.referenceData, // Use standard reference data configuration
  });

  return {
    lessonsByVocabulary: data ?? [],
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
