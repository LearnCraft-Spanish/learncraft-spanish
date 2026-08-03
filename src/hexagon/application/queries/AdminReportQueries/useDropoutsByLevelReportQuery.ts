import type { ActiveMembershipsByCourse } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const DROPOUTS_BY_LEVEL_REPORT_QUERY_KEY = [
  'dropoutsByLevelReport',
] as const;

export interface UseDropoutsByLevelReportQueryReturn {
  dropoutsByLevelReportQuery: UseQueryResult<ActiveMembershipsByCourse[]>;
}

export function useDropoutsByLevelReportQuery(): UseDropoutsByLevelReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const dropoutsByLevelReportQuery = useQuery({
    queryKey: DROPOUTS_BY_LEVEL_REPORT_QUERY_KEY,
    queryFn: () => adapter.getDropoutsByLevelReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { dropoutsByLevelReportQuery };
}
