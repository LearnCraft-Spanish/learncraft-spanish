import type { Coach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachAdapter } from '@application/adapters/coachAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_COACHES_QUERY_KEY = ['allCoaches'] as const;

export interface UseAllCoachesQueryReturn {
  allCoachesQuery: UseQueryResult<Coach[]>;
}

export function useAllCoachesQuery(): UseAllCoachesQueryReturn {
  const adapter = useCoachAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const allCoachesQuery = useQuery({
    queryKey: ALL_COACHES_QUERY_KEY,
    queryFn: () => adapter.getAllCoaches(),
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { allCoachesQuery };
}
