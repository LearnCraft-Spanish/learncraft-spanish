import type { LeadsToReEngage } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const LEADS_TO_RE_ENGAGE_REPORT_QUERY_KEY = [
  'leadsToReEngageReport',
] as const;

export interface UseLeadsToReEngageReportQueryReturn {
  leadsToReEngageReportQuery: UseQueryResult<LeadsToReEngage[]>;
}

export function useLeadsToReEngageReportQuery(): UseLeadsToReEngageReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const leadsToReEngageReportQuery = useQuery({
    queryKey: LEADS_TO_RE_ENGAGE_REPORT_QUERY_KEY,
    queryFn: () => adapter.getLeadsToReEngageReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { leadsToReEngageReportQuery };
}
