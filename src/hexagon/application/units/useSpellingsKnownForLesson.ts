import type { useSpellingsKnownForLessonResult } from './useSpellingsKnownForLesson.types';
import { useQuery } from '@tanstack/react-query';
import { useCourseAdapter } from '../adapters/courseAdapter';

export function useSpellingsKnownForLesson({
  courseId,
  lessonNumber,
  isFrequensayEnabled,
}: {
  courseId?: number;
  lessonNumber?: number;
  isFrequensayEnabled?: boolean;
}): useSpellingsKnownForLessonResult {
  const adapter = useCourseAdapter();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['spellingsKnownForLesson', courseId, lessonNumber],
    queryFn: () => {
      if (!courseId || !lessonNumber) {
        throw new Error('Missing required parameters');
      }
      return adapter.getSpellingsKnownForLesson(courseId, lessonNumber);
    },
    enabled: !!courseId && !!lessonNumber && isFrequensayEnabled,
    staleTime: Infinity,
  });

  return { data, isLoading, error };
}
