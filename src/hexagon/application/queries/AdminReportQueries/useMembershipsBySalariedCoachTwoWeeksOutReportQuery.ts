import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const MEMBERSHIPS_BY_SALARIED_COACH_TWO_WEEKS_OUT_REPORT_QUERY_KEY = [
  'membershipsBySalariedCoachTwoWeeksOutReport',
] as const;

export interface UseMembershipsBySalariedCoachTwoWeeksOutReportQueryReturn {
  membershipsBySalariedCoachTwoWeeksOutReportQuery: UseQueryResult<
    MembershipsByCoach[]
  >;
}

export function useMembershipsBySalariedCoachTwoWeeksOutReportQuery(): UseMembershipsBySalariedCoachTwoWeeksOutReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const membershipsBySalariedCoachTwoWeeksOutReportQuery = useQuery({
    queryKey: MEMBERSHIPS_BY_SALARIED_COACH_TWO_WEEKS_OUT_REPORT_QUERY_KEY,
    queryFn: async () => {
      const data =
        await adapter.getMembershipsBySalariedCoachTwoWeeksOutReport();
      return data.sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      );
    },
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { membershipsBySalariedCoachTwoWeeksOutReportQuery };
}
