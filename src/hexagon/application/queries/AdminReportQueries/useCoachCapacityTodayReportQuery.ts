import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const COACH_CAPACITY_TODAY_REPORT_QUERY_KEY = [
  'coachCapacityTodayReport',
] as const;

export interface UseCoachCapacityTodayReportQueryReturn {
  coachCapacityTodayReportQuery: UseQueryResult<CoachCapacityReportRow[]>;
}

export function useCoachCapacityTodayReportQuery(): UseCoachCapacityTodayReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  // Capacity changes during the day, so unlike the other admin reports this one
  // refetches every time it mounts (each time its section is opened).
  const coachCapacityTodayReportQuery = useQuery({
    queryKey: COACH_CAPACITY_TODAY_REPORT_QUERY_KEY,
    queryFn: () => adapter.getCoachCapacityTodayReport(),
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: isAdmin,
  });

  return { coachCapacityTodayReportQuery };
}
