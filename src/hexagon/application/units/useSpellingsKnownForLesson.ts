import type { useSpellingsKnownForLessonResult } from './useSpellingsKnownForLesson.types';
import { useFrequensayAdapter } from '@application/adapters/frequensayAdapter';
import { useQuery } from '@tanstack/react-query';
export function useSpellingsKnownForLesson({
  courseName,
  lessonNumber,
  isFrequensayEnabled,
}: {
  courseName?: string;
  lessonNumber?: number;
  isFrequensayEnabled?: boolean;
}): useSpellingsKnownForLessonResult {
  const adapter = useFrequensayAdapter();

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['spellingsKnownForLesson', courseName, lessonNumber],
    queryFn: () => {
      if (!courseName || !lessonNumber) {
        throw new Error('Missing required parameters');
      }
      return adapter.getSpellingsKnownForLesson({
        courseName,
        lessonNumber: lessonNumber.toString(),
      });
    },
    enabled: !!courseName && !!lessonNumber && isFrequensayEnabled,
    staleTime: Infinity,
  });

  return { data, isLoading, error };
}
