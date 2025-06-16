import type { Course } from '@LearnCraft-Spanish/shared';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery } from '@tanstack/react-query';

export interface UseCourseListResult {
  courses: Course[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage subcategories.
 * This is a unit hook with a single responsibility that can be composed into different use cases.
 */
export function useCourseList(): UseCourseListResult {
  // Create adapter - infrastructure is now composed internally
  const { getCourses } = useCourseAdapter();

  // Use TanStack Query to fetch and cache subcategories
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
    ...queryDefaults.referenceData, // Use standard reference data configuration
  });

  return {
    courses: data,
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
