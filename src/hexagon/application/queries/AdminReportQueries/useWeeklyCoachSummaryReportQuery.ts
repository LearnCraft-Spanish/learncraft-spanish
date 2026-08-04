import type { CoachSummary } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const WEEKLY_COACH_SUMMARY_REPORT_QUERY_KEY = [
  'weeklyCoachSummaryReport',
] as const;

export interface UseWeeklyCoachSummaryReportQueryReturn {
  weeklyCoachSummaryReportQuery: UseQueryResult<CoachSummary[]>;
}

export function useWeeklyCoachSummaryReportQuery(): UseWeeklyCoachSummaryReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const weeklyCoachSummaryReportQuery = useQuery({
    queryKey: WEEKLY_COACH_SUMMARY_REPORT_QUERY_KEY,
    queryFn: () => adapter.getWeeklyCoachSummaryReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { weeklyCoachSummaryReportQuery };
}
