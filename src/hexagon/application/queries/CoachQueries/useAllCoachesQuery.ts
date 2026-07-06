import type { Coach } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachAdapter } from '@application/adapters/coachAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_COACHES_QUERY_KEY = ['allCoaches'] as const;

export interface UseAllCoachesQueryReturn {
  coaches: Coach[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAllCoachesQuery(): UseAllCoachesQueryReturn {
  const adapter = useCoachAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ALL_COACHES_QUERY_KEY,
    queryFn: async () => {
      const data = await adapter.getAllCoaches();
      return data.sort((a, b) => a.fullName.localeCompare(b.fullName));
    },
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { coaches: data, isLoading, error };
}
