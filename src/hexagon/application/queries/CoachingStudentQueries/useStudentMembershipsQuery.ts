import type { StudentMembership } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const STUDENT_MEMBERSHIPS_QUERY_KEY = (srStudentId: number) =>
  ['studentMemberships', srStudentId] as const;

export interface UseStudentMembershipsQueryReturn {
  studentMembershipsQuery: UseQueryResult<StudentMembership[]>;
}

export function useStudentMembershipsQuery(
  srStudentId: number,
): UseStudentMembershipsQueryReturn {
  const adapter = useCoachingStudentsAdapter();

  const studentMembershipsQuery = useQuery({
    queryKey: STUDENT_MEMBERSHIPS_QUERY_KEY(srStudentId),
    queryFn: () => adapter.getStudentMemberships(srStudentId),
    enabled: srStudentId > 0,
  });

  return { studentMembershipsQuery };
}
