import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
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
      const parsed = z.string().uuid().safeParse(uuid);
      if (!parsed.success) {
        throw new Error('Invalid UUID');
      }
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

  const fetchFilteredExamples = useCallback(async () => {
    const { examples, totalCount } = await exampleAdapter.getFilteredExamples({
      courseId: course!.id,
      toLessonNumber: toLesson!.lessonNumber,
      fromLessonNumber: fromLesson?.lessonNumber,
      excludeSpanglish: filterState!.excludeSpanglish,
      audioOnly: filterState!.audioOnly,
      skillTags: filterState!.skillTags,
      page,
      limit: pageSize,
      seed: seed!,
    });
    return { examples, totalCount };
  }, [
    course,
    toLesson,
    fromLesson,
    filterState,
    exampleAdapter,
    page,
    pageSize,
    seed,
  ]);

  const {
    data: fullResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'filteredExamples',
      page,
      pageSize,
      course?.id,
      toLesson?.lessonNumber,
      fromLesson?.lessonNumber,
      filterState?.excludeSpanglish,
      filterState?.audioOnly,
      filterState?.skillTags,
      seed,
    ],
    queryFn: fetchFilteredExamples,
    enabled: !!filterState && !!course && !!toLesson && !!seed,
  });

  const shouldPrefetch = useMemo(() => {
    const index = pageSize * page;
    const totalCount = fullResponse?.totalCount ?? null;
    if (totalCount === null) {
      return false;
    }
    return index < totalCount;
  }, [page, pageSize, fullResponse?.totalCount]);

  useMemo(() => {
    if (
      shouldPrefetch &&
      canPrefetch &&
      !!filterState &&
      !!course &&
      !!toLesson &&
      !!fromLesson
    ) {
      queryClient.prefetchQuery({
        queryKey: [
          'filteredExamples',
          page + 1,
          pageSize,
          course?.id,
          toLesson?.lessonNumber,
          fromLesson?.lessonNumber,
          filterState?.excludeSpanglish,
          filterState?.audioOnly,
          filterState?.skillTags,
          seed,
        ],
        queryFn: fetchFilteredExamples,
        ...queryDefaults.entityData,
        staleTime: 15 * 60 * 1000, // 2 minutes cache
      });
    }
  }, [
    shouldPrefetch,
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
