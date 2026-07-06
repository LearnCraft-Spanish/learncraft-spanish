import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const MEMBERSHIPS_BY_COACH_TWO_WEEKS_OUT_REPORT_QUERY_KEY = [
  'membershipsByCoachTwoWeeksOutReport',
] as const;

export interface UseMembershipsByCoachTwoWeeksOutReportQueryReturn {
  membershipsByCoachTwoWeeksOutReportQuery: UseQueryResult<
    MembershipsByCoach[]
  >;
}

export function useMembershipsByCoachTwoWeeksOutReportQuery(): UseMembershipsByCoachTwoWeeksOutReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const membershipsByCoachTwoWeeksOutReportQuery = useQuery({
    queryKey: MEMBERSHIPS_BY_COACH_TWO_WEEKS_OUT_REPORT_QUERY_KEY,
    queryFn: async () => {
      const data = await adapter.getMembershipsByCoachTwoWeeksOutReport();
      return data.sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      );
    },
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { membershipsByCoachTwoWeeksOutReportQuery };
}
