import type { SrCourse } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_SR_COURSES_QUERY_KEY = ['allSrCourses'] as const;

export interface UseAllSrCoursesQueryReturn {
  allSrCoursesQuery: UseQueryResult<SrCourse[]>;
}

export function useAllSrCoursesQuery(): UseAllSrCoursesQueryReturn {
  const adapter = useCoachingStudentsAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const allSrCoursesQuery = useQuery({
    queryKey: ALL_SR_COURSES_QUERY_KEY,
    queryFn: () => adapter.getAllSrCourses(),
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { allSrCoursesQuery };
}
