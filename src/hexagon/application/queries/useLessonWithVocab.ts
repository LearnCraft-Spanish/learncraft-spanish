import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export const useLessonVocabKnown = (
  courseId: number | null,
  lessonNumber: number | null,
  enabled?: boolean,
) => {
  const courseInfrastructure = useCourseAdapter();
  const {
    data: lessonVocabKnown,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lessonWithVocab', courseId, lessonNumber],
    queryFn: () =>
      courseInfrastructure.getLessonVocabKnown({
        courseId: courseId!,
        lessonNumber: lessonNumber!,
      }),
    enabled: !!courseId && !!lessonNumber && enabled,
  });

  return { lessonVocabKnown, isLoading, error };
};

export const useLessonRangeVocabRequired = (
  courseId: number | null,
  fromLessonNumber: number | null,
  toLessonNumber: number | null,
  enabled?: boolean,
) => {
  const courseInfrastructure = useCourseAdapter();

  const {
    data: lessonRangeVocabRequired,
    isLoading,
    error,
  } = useQuery({
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
    enabled: !!courseId && !!fromLessonNumber && !!toLessonNumber && enabled,
  });

  return { lessonRangeVocabRequired, isLoading, error };
};
