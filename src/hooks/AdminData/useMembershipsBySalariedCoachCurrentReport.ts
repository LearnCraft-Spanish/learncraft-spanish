import { useMembershipsBySalariedCoachCurrentReportQuery } from '@application/queries/AdminReportQueries/useMembershipsBySalariedCoachCurrentReportQuery';

export default function useMembershipsBySalariedCoachCurrentReport() {
  const { membershipsBySalariedCoachCurrentReportQuery } =
    useMembershipsBySalariedCoachCurrentReportQuery();

  return { membershipsBySalariedCoachCurrentReportQuery };
}
