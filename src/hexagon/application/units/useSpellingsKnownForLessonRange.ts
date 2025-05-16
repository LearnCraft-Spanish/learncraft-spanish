import { useFrequensayAdapter } from '@application/adapters/frequensayAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseSpellingsKnownForLessonRangeResult {
  data: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useSpellingsKnownForLessonRange({
  courseName,
  lessonToNumber,
  lessonFromNumber,
  isFrequensayEnabled,
}: {
  courseName?: string;
  lessonToNumber?: number;
  lessonFromNumber?: number;
  isFrequensayEnabled?: boolean;
}): UseSpellingsKnownForLessonRangeResult {
  const adapter = useFrequensayAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'spellingsKnownForLessonRange',
      courseName,
      lessonToNumber,
      lessonFromNumber,
    ],
    queryFn: () => {
      if (!courseName || !lessonToNumber) {
        throw new Error('Missing required parameters');
      }
      return adapter.getSpellingsKnownForLesson({
        courseName,
        lessonToNumber: lessonToNumber.toString(),
        lessonFromNumber: lessonFromNumber?.toString() || '0',
      });
    },
    enabled: !!courseName && !!lessonToNumber && isFrequensayEnabled,
    staleTime: Infinity,
  });

  return {
    data,
    isLoading,
    error,
  };
}
