import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
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
    queryFn: () => {
      // Transform single lesson to lesson range format
      const lessonRanges = transformToLessonRanges({
        courseId,
        fromLessonNumber: lessonNumber,
        toLessonNumber: lessonNumber,
      });

      return courseInfrastructure.getLessonVocabKnown({
        lessonRanges,
      });
    },
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
    queryFn: async () => {
      // Always transform to lesson ranges
      const lessonRanges = transformToLessonRanges({
        courseId,
        fromLessonNumber,
        toLessonNumber,
      });

      // Use the lesson range vocab required endpoint
      return courseInfrastructure.getLessonRangeVocabRequired({
        lessonRanges,
      });
    },
    enabled: !!courseId && !!toLessonNumber && enabled,
  });

  return { lessonRangeVocabRequired, isLoading, error };
};
