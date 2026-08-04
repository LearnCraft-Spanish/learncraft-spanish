import type { ActiveMembershipsByCourse } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const ACTIVE_MEMBERSHIPS_REPORT_QUERY_KEY = [
  'activeMembershipsReport',
] as const;

export interface UseActiveMembershipsReportQueryReturn {
  activeMembershipsReportQuery: UseQueryResult<ActiveMembershipsByCourse[]>;
}

export function useActiveMembershipsReportQuery(): UseActiveMembershipsReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const activeMembershipsReportQuery = useQuery({
    queryKey: ACTIVE_MEMBERSHIPS_REPORT_QUERY_KEY,
    queryFn: () => adapter.getActiveMembershipsReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { activeMembershipsReportQuery };
}
