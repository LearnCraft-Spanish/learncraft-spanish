import type { Example, SkillTag } from '@LearnCraft-Spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import useExampleFilter from '../units/useExampleFilter';
import { useSkillTags } from './useSkillTags';

export interface UseExampleQueryReturnType {
  isLoading: boolean;
  filteredExamples: Example[] | null;
  totalCount: number | null;
  error: Error | null;
  page: number;
  pageSize: number;
  changePage: (page: number) => void;
}
export const useExampleQuery = (
  pageSize: number,
): UseExampleQueryReturnType => {
  const { filterState } = useExampleFilterCoordinator();
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const { filtersChanging } = useExampleFilter();
  const { skillTags } = useSkillTags();
  const exampleAdapter = useExampleAdapter();
  const [page, setPage] = useState(1);

  const changePage = useCallback((page: number) => {
    setPage(page);
  }, []);

  const tagsToSearch: SkillTag[] = useMemo(() => {
    const tagKeys = filterState?.exampleFilters.skillTags;
    const tagsUnfiltered = tagKeys?.map((k) => {
      return skillTags?.find((tag: SkillTag) => tag.key === k) ?? null;
    });
    const tagsFiltered = tagsUnfiltered?.filter((tag) => tag !== null) ?? [];
    return tagsFiltered;
  }, [filterState?.exampleFilters.skillTags, skillTags]);

  const fetchFilteredExamples = useCallback(async () => {
    const { examples, totalCount } = (await exampleAdapter.getFilteredExamples({
      courseId: course!.id,
      toLessonNumber: toLesson!.lessonNumber,
      fromLessonNumber: fromLesson?.lessonNumber,
      spanglishOnly: filterState!.exampleFilters.excludeSpanglish,
      audioOnly: filterState!.exampleFilters.audioOnly,
      skillTags: tagsToSearch,
    })) || { examples: [], totalCount: 0 };
    return { examples, totalCount };
  }, [course, toLesson, fromLesson]);

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
      filterState?.exampleFilters.excludeSpanglish,
      filterState?.exampleFilters.audioOnly,
      filterState?.exampleFilters.skillTags,
    ],
    queryFn: fetchFilteredExamples,
    enabled:
      filterState !== null &&
      course !== null &&
      toLesson !== null &&
      !filtersChanging,
  });

  const filteredExamples = useMemo(() => {
    return fullResponse?.examples ?? null;
  }, [fullResponse, page, pageSize]);

  const totalCount = useMemo(() => {
    return fullResponse?.totalCount ?? null;
  }, [fullResponse]);

  return {
    isLoading,
    filteredExamples,
    error,
    totalCount,
    page,
    pageSize,
    changePage,
  };
};
