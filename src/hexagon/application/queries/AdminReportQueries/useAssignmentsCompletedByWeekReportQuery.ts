import type { AssignmentsCompletedByWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY = [
  'assignmentsCompletedByWeekReport',
] as const;

export interface UseAssignmentsCompletedByWeekReportQueryReturn {
  assignmentsCompletedByWeekReportQuery: UseQueryResult<
    AssignmentsCompletedByWeek[]
  >;
}

export function useAssignmentsCompletedByWeekReportQuery(): UseAssignmentsCompletedByWeekReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const assignmentsCompletedByWeekReportQuery = useQuery({
    queryKey: ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY,
    queryFn: async () => {
      const data = await adapter.getAssignmentsCompletedByWeekReport();
      return data.sort((a, b) => a.courseName.localeCompare(b.courseName));
    },
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { assignmentsCompletedByWeekReportQuery };
}
