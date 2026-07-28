import { useGroupCallsByCoachReportQuery } from '@application/queries/AdminReportQueries/useGroupCallsByCoachReportQuery';

export default function useGroupCallsByCoach() {
  const { groupCallsByCoachReportQuery } = useGroupCallsByCoachReportQuery();
  return { groupCallsByCoachQuery: groupCallsByCoachReportQuery };
}
