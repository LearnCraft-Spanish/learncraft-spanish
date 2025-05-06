import { useQuery } from '@tanstack/react-query';
import { useFrequensayAdapter } from '../adapters/frequensayAdapter';

export interface UseSpellingsKnownForLessonRangeResult {
  data: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export default function useSpellingsKnownForLessonRange({
  courseName,
  lessonToNumber,
  lessonFromNumber,
}: {
  courseName?: string;
  lessonToNumber?: number;
  lessonFromNumber?: number;
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
      return adapter.getSpellingsKnownForLesson({
        courseName: courseName || '',
        lessonToNumber: lessonToNumber?.toString() || '0',
        lessonFromNumber: lessonFromNumber?.toString() || '0',
      });
    },
    enabled: !!courseName && !!lessonToNumber,
    staleTime: Infinity,
  });

  return {
    data,
    isLoading,
    error,
  };
}
