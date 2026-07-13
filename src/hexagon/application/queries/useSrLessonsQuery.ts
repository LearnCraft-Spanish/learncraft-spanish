import type { SrLesson } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useSrLessonsAdapter } from '@application/adapters/srLessonsAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseSrLessonsQueryReturn {
  data: SrLesson[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useSrLessonsQuery(): UseSrLessonsQueryReturn {
  const { isAdmin, isCoach } = useAuthAdapter();
  const srLessonsAdapter = useSrLessonsAdapter();
  const { data, isLoading, error } = useQuery<SrLesson[]>({
    queryKey: ['srLessons'],
    queryFn: () => srLessonsAdapter.getSrLessons(),
    staleTime: Infinity,
    enabled: isAdmin || isCoach,
  });

  return {
    data,
    isLoading,
    error,
  };
}
