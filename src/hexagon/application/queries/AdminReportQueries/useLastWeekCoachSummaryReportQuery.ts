import type { CoachSummary } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const LAST_WEEK_COACH_SUMMARY_REPORT_QUERY_KEY = [
  'lastWeekCoachSummaryReport',
] as const;

export interface UseLastWeekCoachSummaryReportQueryReturn {
  lastWeekCoachSummaryReportQuery: UseQueryResult<CoachSummary[]>;
}

export function useLastWeekCoachSummaryReportQuery(): UseLastWeekCoachSummaryReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const lastWeekCoachSummaryReportQuery = useQuery({
    queryKey: LAST_WEEK_COACH_SUMMARY_REPORT_QUERY_KEY,
    queryFn: () => adapter.getLastWeekCoachSummaryReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { lastWeekCoachSummaryReportQuery };
}
