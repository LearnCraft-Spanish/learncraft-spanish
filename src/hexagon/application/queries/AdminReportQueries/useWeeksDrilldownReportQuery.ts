import type { CoachSummaryDrilldown } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseWeeksDrilldownReportQueryReturn {
  weeksDrilldownReportQuery: UseQueryResult<CoachSummaryDrilldown[]>;
}

export function useWeeksDrilldownReportQuery(
  coachName: string,
  report: string,
): UseWeeksDrilldownReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const weeksDrilldownReportQuery = useQuery({
    queryKey: ['weeksDrilldownReport', coachName, report],
    queryFn: () =>
      adapter.getWeeksDrilldownReport(
        coachName,
        report as 'Weekly Coach Summary' | 'Last Week Coach Summary',
      ),
    staleTime: Infinity,
    enabled: isAdmin && !!coachName,
  });

  return { weeksDrilldownReportQuery };
}
