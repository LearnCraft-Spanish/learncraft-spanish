import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { useExampleAdapter } from '../adapters/exampleAdapter';
import { useExampleFilterCoordinator } from '../coordinators/hooks/useExampleFilterCoordinator';
import { useSelectedCourseAndLessons } from '../coordinators/hooks/useSelectedCourseAndLessons';
import { useSkillTags } from './useSkillTags';

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
  const { filterState, filtersChanging } = useExampleFilterCoordinator();
  const { course, fromLesson, toLesson } = useSelectedCourseAndLessons();
  const { skillTags } = useSkillTags();
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
      skillTags?.length === 0 ||
      filterState?.exampleFilters.includeSpanglish ||
      filterState?.exampleFilters.audioOnly
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
    skillTags,
    filterState?.exampleFilters.includeSpanglish,
    filterState?.exampleFilters.audioOnly,
  ]);

  const tagsToSearch: SkillTag[] = useMemo(() => {
    const tagKeys = filterState?.exampleFilters.skillTags;
    const tagsUnfiltered = tagKeys?.map((k) => {
      return skillTags?.find((tag: SkillTag) => tag.key === k) ?? null;
    });
    const tagsFiltered = tagsUnfiltered?.filter((tag) => tag !== null) ?? [];
    return tagsFiltered;
  }, [filterState?.exampleFilters.skillTags, skillTags]);

  const fetchFilteredExamples = useCallback(async () => {
    const { examples, totalCount } = await exampleAdapter.getFilteredExamples({
      courseId: course!.id,
      toLessonNumber: toLesson!.lessonNumber,
      fromLessonNumber: fromLesson?.lessonNumber,
      includeSpanglish: filterState!.exampleFilters.includeSpanglish,
      audioOnly: filterState!.exampleFilters.audioOnly,
      skillTags: tagsToSearch,
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
    tagsToSearch,
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
      filterState?.exampleFilters.includeSpanglish,
      filterState?.exampleFilters.audioOnly,
      filterState?.exampleFilters.skillTags,
      seed,
    ],
    queryFn: fetchFilteredExamples,
    enabled:
      filterState !== null &&
      course !== null &&
      toLesson !== null &&
      !filtersChanging,
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
