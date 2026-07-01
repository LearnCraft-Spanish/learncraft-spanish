import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const MEMBERSHIPS_BY_SALARIED_COACH_CURRENT_REPORT_QUERY_KEY = [
  'membershipsBySalariedCoachCurrentReport',
] as const;

export interface UseMembershipsBySalariedCoachCurrentReportQueryReturn {
  membershipsBySalariedCoachCurrentReportQuery: UseQueryResult<
    MembershipsByCoach[]
  >;
}

export function useMembershipsBySalariedCoachCurrentReportQuery(): UseMembershipsBySalariedCoachCurrentReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const membershipsBySalariedCoachCurrentReportQuery = useQuery({
    queryKey: MEMBERSHIPS_BY_SALARIED_COACH_CURRENT_REPORT_QUERY_KEY,
    queryFn: async () => {
      const data = await adapter.getMembershipsBySalariedCoachCurrentReport();
      return data.sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      );
    },
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { membershipsBySalariedCoachCurrentReportQuery };
}
