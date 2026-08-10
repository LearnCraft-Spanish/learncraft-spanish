import { useWeeklyTimeCommitmentByCoachReportQuery } from '@application/queries/AdminReportQueries/useWeeklyTimeCommitmentByCoachReportQuery';

export default function useWeeklyTimeCommitmentByCoach() {
  const { weeklyTimeCommitmentByCoachReportQuery } =
    useWeeklyTimeCommitmentByCoachReportQuery();

  return { weeklyTimeCommitmentByCoachReportQuery };
}
