import { useMembershipsByCoachTwoWeeksOutReportQuery } from '@application/queries/AdminReportQueries/useMembershipsByCoachTwoWeeksOutReportQuery';

export default function useMembershipsByCoachTwoWeeksOutReport() {
  const { membershipsByCoachTwoWeeksOutReportQuery } =
    useMembershipsByCoachTwoWeeksOutReportQuery();

  return { membershipsByCoachTwoWeeksOutReportQuery };
}
