import type { RecentRecords } from '@learncraft-spanish/shared';
import { useCoachAdapter } from '@application/adapters/coachAdapter';
import { useQuery } from '@tanstack/react-query';

export const RECENT_RECORDS_QUERY_KEY = ['recent-records'] as const;

export interface UseRecentRecordsQueryReturn {
  recentRecords: RecentRecords | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRecentRecordsQuery(
  coachId: string | undefined,
  monthYear: string,
): UseRecentRecordsQueryReturn {
  const adapter = useCoachAdapter();

  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: [...RECENT_RECORDS_QUERY_KEY, coachId, monthYear],
    queryFn: () => {
      if (!coachId) {
        throw new Error('coachId is required');
      }
      return adapter.getRecentRecords(coachId, monthYear);
    },
    enabled: !!coachId && !!monthYear,
    staleTime: Infinity,
  });

  return {
    recentRecords: data,
    isLoading,
    isError,
    isSuccess,
    error,
    refetch,
  };
}
