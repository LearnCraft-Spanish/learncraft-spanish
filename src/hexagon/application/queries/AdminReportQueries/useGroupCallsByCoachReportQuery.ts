import type { GroupCallsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const GROUP_CALLS_BY_COACH_REPORT_QUERY_KEY = [
  'groupCallsByCoachReport',
] as const;

export interface UseGroupCallsByCoachReportQueryReturn {
  groupCallsByCoachReportQuery: UseQueryResult<GroupCallsByCoach[]>;
}

export function useGroupCallsByCoachReportQuery(): UseGroupCallsByCoachReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const groupCallsByCoachReportQuery = useQuery({
    queryKey: GROUP_CALLS_BY_COACH_REPORT_QUERY_KEY,
    queryFn: () => adapter.getGroupCallsByCoachReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { groupCallsByCoachReportQuery };
}
