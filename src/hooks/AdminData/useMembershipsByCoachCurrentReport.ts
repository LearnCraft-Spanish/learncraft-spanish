import { useMembershipsByCoachCurrentReportQuery } from '@application/queries/AdminReportQueries/useMembershipsByCoachCurrentReportQuery';

export default function useMembershipsByCoachCurrentReport() {
  const { membershipsByCoachCurrentReportQuery } =
    useMembershipsByCoachCurrentReportQuery();

  return { membershipsByCoachCurrentReportQuery };
}
