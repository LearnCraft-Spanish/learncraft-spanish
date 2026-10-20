import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdminReportsAdapter } from '@application/adapters/AdminReports/adminReportsAdapter';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useQuery } from '@tanstack/react-query';

export const LAPSED_LONG_TERM_COACHING_STUDENTS_REPORT_QUERY_KEY = [
  'lapsedLongTermCoachingStudentsReport',
] as const;

export interface UseLapsedLongTermCoachingStudentsReportQueryReturn {
  lapsedLongTermCoachingStudentsReportQuery: UseQueryResult<
    LapsedLongTermCoachingStudent[]
  >;
}

export function useLapsedLongTermCoachingStudentsReportQuery(): UseLapsedLongTermCoachingStudentsReportQueryReturn {
  const adapter = useAdminReportsAdapter();
  const { isAdmin } = useAuthAdapter();

  const lapsedLongTermCoachingStudentsReportQuery = useQuery({
    queryKey: LAPSED_LONG_TERM_COACHING_STUDENTS_REPORT_QUERY_KEY,
    queryFn: () => adapter.getLapsedLongTermCoachingStudentsReport(),
    staleTime: Infinity,
    enabled: isAdmin,
  });

  return { lapsedLongTermCoachingStudentsReportQuery };
}
