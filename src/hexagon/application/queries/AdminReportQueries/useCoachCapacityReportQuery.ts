import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

/**
 * Every Coach Capacity report's key starts with this, so one invalidation
 * covers them all (a coach's settings show up in each report).
 */
export const COACH_CAPACITY_REPORT_QUERY_KEY = ['coachCapacityReport'] as const;

export interface UseCoachCapacityReportQueryReturn {
  coachCapacityReportQuery: UseQueryResult<CoachCapacityReportRow[]>;
}

export function useCoachCapacityReportQuery(
  period: CoachCapacityPeriod,
): UseCoachCapacityReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const fetchReport: Record<
    CoachCapacityPeriod,
    () => Promise<CoachCapacityReportRow[]>
  > = {
    today: () => adapter.getCoachCapacityTodayReport(),
    twoWeeksOut: () => adapter.getCoachCapacityTwoWeeksOutReport(),
  };

  // Capacity changes during the day, so unlike the other admin reports this one
  // refetches every time it mounts (each time its section is opened).
  const coachCapacityReportQuery = useQuery({
    queryKey: [...COACH_CAPACITY_REPORT_QUERY_KEY, period],
    queryFn: fetchReport[period],
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: isAdmin,
  });

  return { coachCapacityReportQuery };
}
