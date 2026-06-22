import type { BundleCredit } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const STUDENT_BUNDLE_CREDITS_QUERY_KEY = (srStudentId: number) =>
  ['studentBundleCredits', srStudentId] as const;

export interface UseStudentBundleCreditsQueryReturn {
  studentBundleCreditsQuery: UseQueryResult<BundleCredit[]>;
}

export function useStudentBundleCreditsQuery(
  srStudentId: number,
): UseStudentBundleCreditsQueryReturn {
  const adapter = useCoachingStudentsAdapter();

  const studentBundleCreditsQuery = useQuery({
    queryKey: STUDENT_BUNDLE_CREDITS_QUERY_KEY(srStudentId),
    queryFn: () => adapter.getStudentBundleCredits(srStudentId),
    enabled: srStudentId > 0,
  });

  return { studentBundleCreditsQuery };
}
