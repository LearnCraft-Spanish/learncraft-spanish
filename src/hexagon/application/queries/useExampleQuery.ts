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
  filteredExamples: ExampleWithVocabulary[] | null;
  totalCount: number | null;
  error: Error | null;
  page: number;
  pageSize: number;
  changeQueryPage: (page: number) => void;
  setCanPrefetch: (canPrefetch: boolean) => void;
}
export const useExampleQuery = (
  pageSize: number,
  filtersChanging: boolean,
  audioRequired?: boolean,
): UseExampleQueryReturnType => {
  const queryClient = useQueryClient();

  // Destructure the combined filter state
  const {
    combinedFilterState,
    isLoading: isLoadingCombinedFilters,
    error: errorCombinedFilters,
  } = useCombinedFilters();

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
  const [page, setPage] = useState(1);
  const [canPrefetch, setCanPrefetch] = useState(false);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

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
          limit: pageSize,
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
      pageSize,
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
      { pageSize },
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
    enabled:
      !isLoadingCombinedFilters &&
      !errorCombinedFilters &&
      !!seed &&
      !filtersChanging,
  });

  const hasMorePages = useMemo(() => {
    const totalCount = fullResponse?.totalCount ?? null;
    if (totalCount === null) {
      return false;
    }
    // Check if there are more items beyond what the next query page would fetch
    const nextPageStartIndex = pageSize * page + 1;
    return nextPageStartIndex <= totalCount;
  }, [page, pageSize, fullResponse?.totalCount]);

  useEffect(() => {
    if (hasMorePages && canPrefetch) {
      queryClient.prefetchQuery({
        queryKey: [
          'filteredExamples',
          page + 1,
          pageSize,
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
    pageSize,
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
    isLoading,
    error,
    filteredExamples: fullResponse?.examples ?? null,
    totalCount: fullResponse?.totalCount ?? null,
    page,
    pageSize,
    changeQueryPage: changePage,
    setCanPrefetch,
  };
};
