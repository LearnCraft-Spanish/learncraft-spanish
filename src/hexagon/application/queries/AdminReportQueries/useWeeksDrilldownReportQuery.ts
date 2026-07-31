import type { WeeksDrilldownReportName } from '@application/ports/AdminReports/adminReportsPort';
import type { CoachSummaryDrilldown } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const WEEKS_DRILLDOWN_REPORT_QUERY_KEY = [
  'weeksDrilldownReport',
] as const;

export interface UseWeeksDrilldownReportQueryReturn {
  weeksDrilldownReportQuery: UseQueryResult<CoachSummaryDrilldown[]>;
}

export function useWeeksDrilldownReportQuery(
  coachName: string,
  report: WeeksDrilldownReportName,
): UseWeeksDrilldownReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const weeksDrilldownReportQuery = useQuery({
    queryKey: [...WEEKS_DRILLDOWN_REPORT_QUERY_KEY, coachName, report],
    queryFn: () => adapter.getWeeksDrilldownReport(coachName, report),
    staleTime: Infinity,
    enabled: isAdmin && !!coachName && !!report,
  });

  return { weeksDrilldownReportQuery };
}
