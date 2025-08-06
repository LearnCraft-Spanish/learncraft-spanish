import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';

export interface UseExampleQueryReturnType {
  isLoading: boolean;
  filteredExamples: ExampleWithVocabulary[] | null;
  totalCount: number | null;
  error: Error | null;
  page: number;
  pageSize: number;
  changeQueryPage: (page: number) => void;
}
export const useExampleQuery = (
  pageSize: number,
): UseExampleQueryReturnType => {
  const { filterState } = useExampleFilterCoordinator();
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const exampleAdapter = useExampleAdapter();
  const [page, setPage] = useState(1);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

  const seed: string | null = useMemo(() => {
    if (
      true ||
      course ||
      toLesson ||
      fromLesson ||
      filterState?.includeSpanglish ||
      filterState?.audioOnly
    ) {
      const uuid = uuidv4();
      const parsed = z.string().uuid().safeParse(uuid);
      if (!parsed.success) {
        throw new Error('Invalid UUID');
      }
      return uuid;
    }
  }, [
    course,
    toLesson,
    fromLesson,
    filterState?.includeSpanglish,
    filterState?.audioOnly,
  ]);

  const fetchFilteredExamples = useCallback(async () => {
    const { examples, totalCount } = await exampleAdapter.getFilteredExamples({
      courseId: course!.id,
      toLessonNumber: toLesson!.lessonNumber,
      fromLessonNumber: fromLesson?.lessonNumber,
      includeSpanglish: filterState!.includeSpanglish,
      audioOnly: filterState!.audioOnly,
      skillTags: filterState!.skillTags,
      page,
      limit: pageSize,
      seed,
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
      toLesson?.id,
      fromLesson?.id,
      filterState?.includeSpanglish,
      filterState?.audioOnly,
      filterState?.skillTags,
      seed,
    ],
    queryFn: fetchFilteredExamples,
    enabled: !!filterState && !!course && !!toLesson,
  });

  return {
    isLoading,
    error,
    filteredExamples: fullResponse?.examples ?? null,
    totalCount: fullResponse?.totalCount ?? null,
    page,
    pageSize,
    changeQueryPage: changePage,
  };
};
