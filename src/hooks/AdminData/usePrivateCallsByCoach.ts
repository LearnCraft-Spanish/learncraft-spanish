import { usePrivateCallsByCoachReportQuery } from '@application/queries/AdminReportQueries/usePrivateCallsByCoachReportQuery';

export default function usePrivateCallsByCoach() {
  const { privateCallsByCoachReportQuery } =
    usePrivateCallsByCoachReportQuery();

  return { privateCallsByCoachQuery: privateCallsByCoachReportQuery };
}
