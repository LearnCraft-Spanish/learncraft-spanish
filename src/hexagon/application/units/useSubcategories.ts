import type { Subcategory } from '@Learncraft-spanish/shared/src/domain/vocabulary/core-types';
import { useQuery } from '@tanstack/react-query';
import { useSubcategoryAdapter } from '../adapters/subcategoryAdapter';
import { normalizeQueryError, queryDefaults } from '../utils/queryUtils';

interface UseSubcategoriesResult {
  subcategories: Subcategory[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage subcategories.
 * This is a unit hook with a single responsibility that can be composed into different use cases.
 */
export function useSubcategories(): UseSubcategoriesResult {
  // Create adapter - infrastructure is now composed internally
  const { getSubcategories } = useSubcategoryAdapter();

  // Use TanStack Query to fetch and cache subcategories
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
    ...queryDefaults.referenceData, // Use standard reference data configuration
  });

  return {
    subcategories: data,
    loading: isLoading,
    error: normalizeQueryError(error),
    refetch,
  };
}
