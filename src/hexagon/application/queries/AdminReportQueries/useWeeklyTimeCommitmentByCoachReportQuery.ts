import type { WeeklyTimeCommitmentByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const WEEKLY_TIME_COMMITMENT_BY_COACH_REPORT_QUERY_KEY = [
  'weeklyTimeCommitmentByCoachReport',
] as const;

export interface UseWeeklyTimeCommitmentByCoachReportQueryReturn {
  weeklyTimeCommitmentByCoachReportQuery: UseQueryResult<
    WeeklyTimeCommitmentByCoach[]
  >;
}

export function useWeeklyTimeCommitmentByCoachReportQuery(): UseWeeklyTimeCommitmentByCoachReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const weeklyTimeCommitmentByCoachReportQuery = useQuery({
    queryKey: WEEKLY_TIME_COMMITMENT_BY_COACH_REPORT_QUERY_KEY,
    queryFn: () => adapter.getWeeklyTimeCommitmentByCoachReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { weeklyTimeCommitmentByCoachReportQuery };
}
