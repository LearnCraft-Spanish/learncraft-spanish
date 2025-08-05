import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export const useLessonWithVocab = (
  courseId: number | undefined,
  lessonNumber: number | undefined,
) => {
  const courseInfrastructure = useCourseAdapter();

  return useQuery({
    queryKey: ['lessonWithVocab', courseId, lessonNumber],
    queryFn: () =>
      courseInfrastructure.getLessonWithVocabulary({
        courseId: courseId!,
        lessonNumber: lessonNumber!,
      }),
    enabled: !!courseId && !!lessonNumber,
  });
};
