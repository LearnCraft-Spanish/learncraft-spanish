import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export const useLessonWithVocab = (courseId: number, lessonNumber: number) => {
  const courseInfrastructure = useCourseAdapter();

  return useQuery({
    queryKey: ['lessonWithVocab', courseId, lessonNumber],
    queryFn: () =>
      courseInfrastructure.getLessonWithVocabulary({
        courseId,
        lessonNumber,
      }),
    enabled: !!courseId && !!lessonNumber,
  });
};
