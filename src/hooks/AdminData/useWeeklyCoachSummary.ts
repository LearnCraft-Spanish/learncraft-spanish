import { useWeeklyCoachSummaryReportQuery } from '@application/queries/AdminReportQueries/useWeeklyCoachSummaryReportQuery';

export default function useWeeklyCoachSummary() {
  const { weeklyCoachSummaryReportQuery } = useWeeklyCoachSummaryReportQuery();
  return { weeklyCoachSummaryQuery: weeklyCoachSummaryReportQuery };
}
