import type { ExampleFilters } from '@LearnCraft-Spanish/shared';
import { useQuery } from '@tanstack/react-query';
import { useExampleAdapter } from '../adapters/exampleAdapter';

export const useFilteredExamples = ({
  courseId,
  toLessonNumber,
  fromLessonNumber,
  spanglish,
  audioOnly,
  skillTags,
}: ExampleFilters) => {
  const exampleAdapter = useExampleAdapter();
  const {
    isLoading,
    data: filteredExamples,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'filteredExamples',
      courseId,
      toLessonNumber,
      fromLessonNumber,
      spanglish,
      audioOnly,
      skillTags?.map((tag) => tag.key),
    ],
    queryFn: () =>
      exampleAdapter.getFilteredExamples({
        courseId,
        toLessonNumber,
        fromLessonNumber,
        spanglishOnly: spanglish,
        audioOnly,
        skillTags,
      }),
  });

  return { isLoading, filteredExamples, error, refetch };
};
