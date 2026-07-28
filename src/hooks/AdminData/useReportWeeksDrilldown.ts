import { useWeeksDrilldownReportQuery } from '@application/queries/AdminReportQueries/useWeeksDrilldownReportQuery';

export default function useReportWeeksDrilldown(
  coachId: string,
  report: string,
) {
  const { weeksDrilldownReportQuery } = useWeeksDrilldownReportQuery(
    coachId,
    report,
  );
  return { reportWeeksDrilldownQuery: weeksDrilldownReportQuery };
}
