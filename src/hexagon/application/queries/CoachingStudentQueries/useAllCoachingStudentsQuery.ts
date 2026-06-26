import type { CoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_COACHING_STUDENTS_QUERY_KEY = ['allCoachingStudents'] as const;

export interface UseAllCoachingStudentsQueryReturn {
  allCoachingStudentsQuery: UseQueryResult<CoachingStudent[]>;
}

export function useAllCoachingStudentsQuery(): UseAllCoachingStudentsQueryReturn {
  const adapter = useCoachingStudentsAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const allCoachingStudentsQuery = useQuery({
    queryKey: ALL_COACHING_STUDENTS_QUERY_KEY,
    queryFn: () => adapter.getAllCoachingStudents(),
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { allCoachingStudentsQuery };
}
