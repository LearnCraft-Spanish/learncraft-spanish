import { useMembershipsBySalariedCoachTwoWeeksOutReportQuery } from '@application/queries/AdminReportQueries/useMembershipsBySalariedCoachTwoWeeksOutReportQuery';

export default function useMembershipsBySalariedCoachTwoWeeksOutReport() {
  const { membershipsBySalariedCoachTwoWeeksOutReportQuery } =
    useMembershipsBySalariedCoachTwoWeeksOutReportQuery();

  return { membershipsBySalariedCoachTwoWeeksOutReportQuery };
}
