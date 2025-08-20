import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
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
): UseExampleQueryReturnType => {
  const queryClient = useQueryClient();
  const { filterState } = useExampleFilterCoordinator();
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const exampleAdapter = useExampleAdapter();
  const [page, setPage] = useState(1);
  const [canPrefetch, setCanPrefetch] = useState(false);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

  const seed: string | null = useMemo(() => {
    if (
      (!!course && !!toLesson) ||
      !!fromLesson ||
      !!filterState.skillTags ||
      !filterState.excludeSpanglish ||
      !!filterState.audioOnly
    ) {
      const uuid = uuidv4();
      return uuid;
    }
    return null;
  }, [
    course,
    toLesson,
    fromLesson,
    filterState.skillTags,
    filterState.excludeSpanglish,
    filterState.audioOnly,
  ]);

  const fetchFilteredExamples = useCallback(
    async ({ prefetchRequest = false }: { prefetchRequest?: boolean }) => {
      const { examples, totalCount } = await exampleAdapter.getFilteredExamples(
        {
          courseId: course!.id,
          toLessonNumber: toLesson!.lessonNumber,
          fromLessonNumber: fromLesson?.lessonNumber,
          excludeSpanglish: filterState!.excludeSpanglish,
          audioOnly: filterState!.audioOnly,
          skillTags: filterState!.skillTags,
          page: prefetchRequest ? page + 1 : page,
          limit: pageSize,
          seed: seed!,
        },
      );
      return { examples, totalCount };
    },
    [
      course,
      toLesson,
      fromLesson,
      filterState,
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
      { courseId: course?.id },
      { toLessonNumber: toLesson?.lessonNumber },
      { fromLessonNumber: fromLesson?.lessonNumber },
      { excludeSpanglish: filterState?.excludeSpanglish },
      { audioOnly: filterState?.audioOnly },
      { skillTags: filterState?.skillTags },
      { seed },
    ],
    queryFn: () => fetchFilteredExamples({ prefetchRequest: false }),
    enabled:
      !!filterState && !!course && !!toLesson && !!seed && !filtersChanging,
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
          { page: page + 1 },
          { pageSize },
          { courseId: course?.id },
          { toLessonNumber: toLesson?.lessonNumber },
          { fromLessonNumber: fromLesson?.lessonNumber },
          { excludeSpanglish: filterState?.excludeSpanglish },
          { audioOnly: filterState?.audioOnly },
          { skillTags: filterState?.skillTags },
          { seed },
        ],
        queryFn: () => fetchFilteredExamples({ prefetchRequest: true }),
        ...queryDefaults.entityData,
        staleTime: 15 * 60 * 1000, // 2 minutes cache
      });
    }
  }, [
    hasMorePages,
    canPrefetch,
    page,
    pageSize,
    course,
    toLesson,
    fromLesson,
    filterState,
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
