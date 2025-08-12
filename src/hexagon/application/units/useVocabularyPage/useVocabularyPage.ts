import type { Vocabulary } from '@learncraft-spanish/shared';
import { useVocabularyAdapter } from '@application/adapters/vocabularyAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface VocabularyPageResult {
  items: Vocabulary[];
  isLoading: boolean; // Primary loading state - just for items
  isCountLoading: boolean; // Separate loading state for count
  isFetching: boolean;
  error: Error | null;
  totalCount: number | null; // Can be null when count is still loading
  totalPages: number | null; // Can be null when count is still loading
  hasMorePages: boolean; // Best-effort indicator if more pages exist
  page: number;
  pageSize: number;
}

/**
 * Hook for paginated vocabulary queries.
 * Optimized for displaying vocabulary items in paginated lists with filtering by subcategory.
 *
 * @param subcategoryId The subcategory ID to filter by
 * @param page Current page number (1-indexed)
 * @param pageSize Number of items per page
 */
export default function useVocabularyPage(
  subcategoryId: number,
  page: number = 1,
  pageSize: number = 25,
): VocabularyPageResult {
  const queryClient = useQueryClient();
  const adapter = useVocabularyAdapter();

  // 1. Vocabulary page query
  const {
    data: pageData,
    isLoading: isPageLoading,
    isFetching: isPageFetching,
    error: pageError,
  } = useQuery({
    queryKey: ['vocabulary', subcategoryId, 'page', page, pageSize],
    queryFn: () =>
      adapter.getVocabularyBySubcategory(subcategoryId, page, pageSize),
    placeholderData: (prev) => prev, // Keep previous data while loading new data
    enabled: subcategoryId > 0,
    ...queryDefaults.entityData,
    staleTime: 15 * 60 * 1000, // 2 minutes cache
  });

  // 2. Total count query - lazy loaded to improve performance
  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = useQuery({
    queryKey: ['vocabulary', subcategoryId, 'count'],
    queryFn: () => adapter.getVocabularyCountBySubcategory(subcategoryId),
    // Cache count for longer since it changes less frequently
    staleTime: 15 * 60 * 1000, // 10 min
    enabled: subcategoryId > 0,
  });

  // 3. Derived metadata
  const totalCount = countData ?? null;
  const totalPages =
    totalCount !== null ? Math.ceil(totalCount / pageSize) : null;

  // Determine if there are likely more pages (best effort)
  const hasMorePages = useMemo(() => {
    // If we know the total, use it
    if (totalPages !== null) {
      return page < totalPages;
    }
    // Otherwise, make an educated guess based on current page size
    return !!(pageData && pageData.length >= pageSize);
  }, [pageData, page, totalPages, pageSize]);

  // 4. Prefetch next page - setup query options declaratively
  useMemo(() => {
    // We should prefetch if:
    // 1. We know there are more pages (from totalPages), or
    // 2. We have a full page and are guessing there might be more
    const shouldPrefetch = subcategoryId > 0 && pageData && hasMorePages;

    if (shouldPrefetch) {
      queryClient.prefetchQuery({
        queryKey: ['vocabulary', subcategoryId, 'page', page + 1, pageSize],
        queryFn: () =>
          adapter.getVocabularyBySubcategory(subcategoryId, page + 1, pageSize),
        ...queryDefaults.entityData,
        staleTime: 15 * 60 * 1000, // 2 minutes cache
      });
    }
  }, [
    subcategoryId,
    page,
    pageData,
    hasMorePages,
    queryClient,
    pageSize,
    adapter,
  ]);

  return {
    items: Array.isArray(pageData) ? pageData : [],
    // Consider both initial loading and fetching for the loading state
    // This ensures we show loading during page transitions
    isLoading: subcategoryId > 0 && (isPageLoading || isPageFetching),
    isCountLoading: subcategoryId > 0 && isCountLoading,
    isFetching: isPageFetching,
    error: normalizeQueryError(pageError || countError),
    totalCount,
    totalPages,
    hasMorePages,
    page,
    pageSize,
  };
}
