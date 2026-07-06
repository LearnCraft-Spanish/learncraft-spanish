import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const MEMBERSHIPS_BY_COACH_CURRENT_REPORT_QUERY_KEY = [
  'membershipsByCoachCurrentReport',
] as const;

export interface UseMembershipsByCoachCurrentReportQueryReturn {
  membershipsByCoachCurrentReportQuery: UseQueryResult<MembershipsByCoach[]>;
}

export function useMembershipsByCoachCurrentReportQuery(): UseMembershipsByCoachCurrentReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const membershipsByCoachCurrentReportQuery = useQuery({
    queryKey: MEMBERSHIPS_BY_COACH_CURRENT_REPORT_QUERY_KEY,
    queryFn: async () => {
      const data = await adapter.getMembershipsByCoachCurrentReport();
      return data.sort((a, b) =>
        a.coach.fullName.localeCompare(b.coach.fullName),
      );
    },
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { membershipsByCoachCurrentReportQuery };
}
