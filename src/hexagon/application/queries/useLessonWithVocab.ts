import type { LessonWithVocab } from '@LearnCraft-Spanish/shared';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseLessonWithVocabResult {
  lessonWithVocab: LessonWithVocab | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage subcategories.
 * This is a unit hook with a single responsibility that can be composed into different use cases.
 */
export function useLessonWithVocab(lessonId: number): UseLessonWithVocabResult {
  // Create adapter - infrastructure is now composed internally
  const { getLessonById } = useCourseAdapter();

  // Use TanStack Query to fetch and cache subcategories
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lessonsWithVocab', lessonId],
    queryFn: () => getLessonById(lessonId),
    ...queryDefaults.referenceData, // Use standard reference data configuration
  });

  return {
    lessonWithVocab: data ?? null,
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
