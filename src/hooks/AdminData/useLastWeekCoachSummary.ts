import { useLastWeekCoachSummaryReportQuery } from '@application/queries/AdminReportQueries/useLastWeekCoachSummaryReportQuery';

export default function useLastWeekCoachSummary() {
  const { lastWeekCoachSummaryReportQuery } =
    useLastWeekCoachSummaryReportQuery();
  return { lastWeekCoachSummaryQuery: lastWeekCoachSummaryReportQuery };
}
