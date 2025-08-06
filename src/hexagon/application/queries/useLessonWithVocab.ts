import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export const useLessonVocabKnown = (
  courseId: number | undefined,
  lessonNumber: number | undefined,
) => {
  const courseInfrastructure = useCourseAdapter();

  return useQuery({
    queryKey: ['lessonWithVocab', courseId, lessonNumber],
    queryFn: () =>
      courseInfrastructure.getLessonVocabKnown({
        courseId: courseId!,
        lessonNumber: lessonNumber!,
      }),
    enabled: !!courseId && !!lessonNumber,
  });
};

export const useLessonRangeVocabRequired = (
  courseId: number | undefined,
  fromLessonNumber: number | undefined,
  toLessonNumber: number | undefined,
) => {
  const courseInfrastructure = useCourseAdapter();

  return useQuery({
    queryKey: [
      'lessonRangeVocabRequired',
      courseId,
      fromLessonNumber,
      toLessonNumber,
    ],
    queryFn: () =>
      courseInfrastructure.getLessonRangeVocabRequired({
        courseId: courseId!,
        fromLessonNumber: fromLessonNumber!,
        toLessonNumber: toLessonNumber!,
      }),
    enabled: !!courseId && !!fromLessonNumber && !!toLessonNumber,
  });
};
