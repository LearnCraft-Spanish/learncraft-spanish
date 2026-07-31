import type { PrivateCallsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const PRIVATE_CALLS_BY_COACH_REPORT_QUERY_KEY = [
  'privateCallsByCoachReport',
] as const;

export interface UsePrivateCallsByCoachReportQueryReturn {
  privateCallsByCoachReportQuery: UseQueryResult<PrivateCallsByCoach[]>;
}

export function usePrivateCallsByCoachReportQuery(): UsePrivateCallsByCoachReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const privateCallsByCoachReportQuery = useQuery({
    queryKey: PRIVATE_CALLS_BY_COACH_REPORT_QUERY_KEY,
    queryFn: () => adapter.getPrivateCallsByCoachReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { privateCallsByCoachReportQuery };
}
