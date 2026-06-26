import type { TimeZone } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_TIME_ZONES_QUERY_KEY = ['allTimeZones'] as const;

export interface UseAllTimeZonesQueryReturn {
  allTimeZonesQuery: UseQueryResult<TimeZone[]>;
}

export function useAllTimeZonesQuery(): UseAllTimeZonesQueryReturn {
  const adapter = useCoachingStudentsAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const allTimeZonesQuery = useQuery({
    queryKey: ALL_TIME_ZONES_QUERY_KEY,
    queryFn: () => adapter.getAllTimeZones(),
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { allTimeZonesQuery };
}
