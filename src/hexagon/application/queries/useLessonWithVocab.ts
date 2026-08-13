import { useCourseAdapter } from '@application/adapters/courseAdapter';
import {
  getPrerequisiteLessonRanges,
  transformToLessonRanges,
} from '@domain/coursePrerequisites';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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

export interface UseCoursePrerequisiteVocabReturnType {
  prerequisiteVocab: number[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * All vocabulary taught by the prerequisite courses a student must complete
 * before the given course. Idle for courses without prerequisites.
 */
export const useCoursePrerequisiteVocab = (
  courseId: number | null,
): UseCoursePrerequisiteVocabReturnType => {
  const courseInfrastructure = useCourseAdapter();

  const lessonRanges = useMemo(
    () => getPrerequisiteLessonRanges(courseId),
    [courseId],
  );

  const {
    data: prerequisiteVocab,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['coursePrerequisiteVocab', courseId],
    queryFn: () => courseInfrastructure.getLessonVocabKnown({ lessonRanges }),
    enabled: lessonRanges.length > 0,
  });

  return { prerequisiteVocab, isLoading, error };
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
