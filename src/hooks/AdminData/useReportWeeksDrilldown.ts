import type { WeeksDrilldownReportName } from '@application/ports/AdminReports/adminReportsPort';
import { useWeeksDrilldownReportQuery } from '@application/queries/AdminReportQueries/useWeeksDrilldownReportQuery';

export default function useReportWeeksDrilldown(
  coachId: string,
  report: WeeksDrilldownReportName,
) {
  const { weeksDrilldownReportQuery } = useWeeksDrilldownReportQuery(
    coachId,
    report,
  );
  return { reportWeeksDrilldownQuery: weeksDrilldownReportQuery };
}
