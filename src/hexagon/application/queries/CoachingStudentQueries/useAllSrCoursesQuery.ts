import type { SrCourse } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { useQuery } from '@tanstack/react-query';

export const ALL_SR_COURSES_QUERY_KEY = ['allSrCourses'] as const;

export interface UseAllSrCoursesQueryReturn {
  srCourses: SrCourse[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useAllSrCoursesQuery(): UseAllSrCoursesQueryReturn {
  const adapter = useCoachingStudentsAdapter();
  const { isCoach, isAdmin } = useAuthAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ALL_SR_COURSES_QUERY_KEY,
    queryFn: async () => {
      const courses = await adapter.getAllSrCourses();
      return courses.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  return { srCourses: data, isLoading, error };
}
