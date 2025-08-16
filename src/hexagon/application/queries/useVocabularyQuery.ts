import type { CreateVocabulary, Vocabulary } from '@learncraft-spanish/shared';
import { useVocabularyAdapter } from '@application/adapters/vocabularyAdapter';
import {
  normalizeQueryError,
  queryDefaults,
} from '@application/utils/queryUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface VocabularyQueryResult {
  items: Vocabulary[];
  isLoading: boolean; // Primary loading state - just for items
  isCountLoading: boolean; // Separate loading state for count
  error: Error | null;
  totalCount: number | null; // Can be null when count is still loading
  page: number;
  pageSize: number;
  changePage: (page: number) => void;
  setCanPrefetch: (canPrefetch: boolean) => void;
  createVocabulary: (command: CreateVocabulary[]) => Promise<number[]>;
  deleteVocabulary: (ids: string[]) => Promise<number>;
  creating: boolean;
  deleting: boolean;
  creationError: Error | null;
  deletionError: Error | null;
}

/**
 * Hook for paginated vocabulary queries.
 * Optimized for displaying vocabulary items in paginated lists with filtering by subcategory.
 *
 * @param subcategoryId The subcategory ID to filter by
 * @param pageSize Number of items per page
 */
export default function useVocabularyBySubcategoryQuery(
  subcategoryId: number,
  pageSize: number = 150,
): VocabularyQueryResult {
  const queryClient = useQueryClient();
  const adapter = useVocabularyAdapter();

  const [page, setPage] = useState(1);
  const [canPrefetch, setCanPrefetch] = useState(false);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

  // 1. Vocabulary page query - prefetching is handled by the usePaginatedTable hook
  const {
    data: pageData,
    isLoading: isPageLoading,
    error: pageError,
  } = useQuery({
    queryKey: ['vocabulary', { subcategoryId }, { page }, { pageSize }],
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

  const hasMorePages = useMemo(() => {
    if (totalCount === null) {
      return false;
    }
    // Check if there are more items beyond what the next query page would fetch
    const nextPageStartIndex = pageSize * page + 1;
    return nextPageStartIndex <= totalCount;
  }, [page, pageSize, totalCount]);

  useEffect(() => {
    if (hasMorePages && canPrefetch) {
      queryClient.prefetchQuery({
        queryKey: [
          'vocabulary',
          { subcategoryId },
          { page: page + 1 },
          { pageSize },
        ],
        queryFn: () =>
          adapter.getVocabularyBySubcategory(subcategoryId, page + 1, pageSize),
        ...queryDefaults.entityData,
      });
    }
  }, [
    hasMorePages,
    canPrefetch,
    queryClient,
    subcategoryId,
    page,
    pageSize,
    adapter,
  ]);

  // Mutations for vocabulary operations
  const createVocabularyMutation = useMutation({
    mutationFn: async (command: CreateVocabulary[]) => {
      const result = adapter.createVocabulary(command);
      const success = !!result;
      if (success) {
        return command.map((c) => c.subcategoryId);
      }
      return [];
    },
    onSuccess: (_data, _variables, context: number[]) => {
      context.forEach((subcategoryId) => {
        queryClient.invalidateQueries({
          queryKey: ['vocabulary', { subcategoryId }],
        });
      });
    },
  });

  const deleteVocabularyMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return adapter.deleteVocabulary(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vocabulary'],
      });
    },
  });

  const createVocabulary = async (
    command: CreateVocabulary[],
  ): Promise<number[]> => {
    return createVocabularyMutation.mutateAsync(command);
  };

  const deleteVocabulary = async (ids: string[]): Promise<number> => {
    const idNumbers = ids.map(Number.parseInt);
    if (idNumbers.some(Number.isNaN)) {
      throw new TypeError('Invalid vocabulary ID');
    }
    return deleteVocabularyMutation.mutateAsync(idNumbers);
  };

  const creationError = normalizeQueryError(createVocabularyMutation.error);
  const deletionError = normalizeQueryError(deleteVocabularyMutation.error);

  return {
    items: pageData ?? [],
    isLoading: subcategoryId > 0 && isPageLoading,
    isCountLoading: subcategoryId > 0 && isCountLoading,
    error: normalizeQueryError(pageError || countError),
    totalCount,
    page,
    pageSize,
    createVocabulary,
    deleteVocabulary,
    creating: createVocabularyMutation.isPending,
    deleting: deleteVocabularyMutation.isPending,
    creationError,
    deletionError,
    changePage,
    setCanPrefetch,
  };
}
