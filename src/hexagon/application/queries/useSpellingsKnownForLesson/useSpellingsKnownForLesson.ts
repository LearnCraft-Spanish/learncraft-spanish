import type { useSpellingsKnownForLessonResult } from '@application/queries/useSpellingsKnownForLesson/useSpellingsKnownForLesson.types';
import { useSpellingAdapter } from '@application/adapters/spellingAdapter';
import { useQuery } from '@tanstack/react-query';

export function useSpellingsKnownForLesson({
  courseId,
  lessonNumber,
  isFrequensayEnabled,
}: {
  courseId?: number;
  lessonNumber?: number;
  isFrequensayEnabled?: boolean;
}): useSpellingsKnownForLessonResult {
  const adapter = useSpellingAdapter();

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
