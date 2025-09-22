import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { queryDefaults } from '../utils/queryUtils';

export interface UseExampleQueryReturnType {
  isLoading: boolean;
  isDependenciesLoading: boolean;
  filteredExamples: ExampleWithVocabulary[] | null;
  totalCount: number | null;
  error: Error | null;
  page: number;
  pageSize: number;
  changeQueryPage: (page: number) => void;
  setCanPrefetch: (canPrefetch: boolean) => void;
  updatePageSize: (newPageSize: number) => void;
}
export const useExampleQuery = (
  pageSize: number,
  audioRequired?: boolean,
): UseExampleQueryReturnType => {
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

  // Mainly used when we need the whole query (unpaginated).
  // That case still requires us to get the total items first so we can't initialize that way.
  const updatePageSize = useCallback((newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Memoize to prev
  const onFilterChange = useCallback(() => {
    changePage(1);
    updatePageSize(pageSize); // reset pageSize to the original default passed in
  }, [changePage, updatePageSize, pageSize]);

  const queryClient = useQueryClient();

  // Destructure the combined filter state
  const {
    combinedFilterState,
    isLoading: isLoadingCombinedFilters,
    error: errorCombinedFilters,
  } = useCombinedFilters({
    onFilterChange,
  });

  // Destructure the combined filter state
  const {
    courseId,
    fromLessonNumber,
    toLessonNumber,
    skillTags,
    excludeSpanglish,
    audioOnly: audioOnlyState,
  } = combinedFilterState;

  const audioOnly = useMemo(() => {
    if (audioRequired) {
      return true;
    }
    return audioOnlyState;
  }, [audioRequired, audioOnlyState]);

  const exampleAdapter = useExampleAdapter();
  const [canPrefetch, setCanPrefetch] = useState(false);

  const seed: string | null = useMemo(() => {
    if (
      (!!courseId && !!toLessonNumber) ||
      !!fromLessonNumber ||
      !!skillTags ||
      !excludeSpanglish ||
      !!audioOnly
    ) {
      const uuid = uuidv4();
      const parsed = z.string().uuid().safeParse(uuid);
      if (!parsed.success) {
        throw new Error('Invalid UUID');
      }
      return uuid;
    }
    return null;
  }, [
    courseId,
    toLessonNumber,
    fromLessonNumber,
    skillTags,
    excludeSpanglish,
    audioOnly,
  ]);

  const fetchFilteredExamples = useCallback(
    async ({ prefetchRequest = false }: { prefetchRequest?: boolean }) => {
      const { examples, totalCount } = await exampleAdapter.getFilteredExamples(
        {
          courseId: courseId!,
          toLessonNumber: toLessonNumber!,
          fromLessonNumber: fromLessonNumber!,
          excludeSpanglish: excludeSpanglish!,
          audioOnly: audioOnly!,
          skillTags: skillTags!,
          page: prefetchRequest ? page + 1 : page,
          limit: currentPageSize,
          seed: seed!,
        },
      );
      return { examples, totalCount };
    },
    [
      courseId,
      toLessonNumber,
      fromLessonNumber,
      excludeSpanglish,
      audioOnly,
      skillTags,
      exampleAdapter,
      page,
      currentPageSize,
      seed,
    ],
  );

  const {
    data: fullResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'filteredExamples',
      { page },
      { pageSize: currentPageSize },
      { courseId },
      { toLessonNumber },
      { fromLessonNumber },
      { excludeSpanglish },
      { audioOnly },
      { skillTags },
      seed,
    ],
    queryFn: () => fetchFilteredExamples({ prefetchRequest: false }),
    ...queryDefaults.referenceData,
    enabled: !isLoadingCombinedFilters && !errorCombinedFilters && !!seed,
  });

  const hasMorePages = useMemo(() => {
    const totalCount = fullResponse?.totalCount ?? null;
    if (totalCount === null) {
      return false;
    }
    // Check if there are more items beyond what the next query page would fetch
    const nextPageStartIndex = currentPageSize * page + 1;
    return nextPageStartIndex <= totalCount;
  }, [page, currentPageSize, fullResponse?.totalCount]);

  useEffect(() => {
    if (hasMorePages && canPrefetch) {
      queryClient.prefetchQuery({
        queryKey: [
          'filteredExamples',
          page + 1,
          currentPageSize,
          { courseId },
          { toLessonNumber },
          { fromLessonNumber },
          { excludeSpanglish },
          { audioOnly },
          { skillTags },
          seed,
        ],
        queryFn: () => fetchFilteredExamples({ prefetchRequest: true }),
        ...queryDefaults.referenceData,
      });
    }
  }, [
    hasMorePages,
    canPrefetch,
    page,
    currentPageSize,
    courseId,
    toLessonNumber,
    fromLessonNumber,
    excludeSpanglish,
    audioOnly,
    skillTags,
    fetchFilteredExamples,
    queryClient,
    seed,
  ]);

  return {
    isDependenciesLoading: isLoadingCombinedFilters,
    isLoading,
    error,
    filteredExamples: fullResponse?.examples ?? null,
    totalCount: fullResponse?.totalCount ?? null,
    page,
    pageSize: currentPageSize,
    changeQueryPage: changePage,
    setCanPrefetch,
    updatePageSize,
  };
};
