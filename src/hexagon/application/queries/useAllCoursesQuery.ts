import type { CourseDetailed } from '@learncraft-spanish/shared';
import type { QueryStatus } from '@tanstack/react-query';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export interface UseAllCoursesQueryReturn {
  data: CourseDetailed[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
  status: QueryStatus;
}

export function useAllCoursesQuery(): UseAllCoursesQueryReturn {
  const adapter = useCourseAdapter();
  const { isAuthenticated, isAdmin } = useAuthAdapter();

  return useQuery({
    queryKey: ['courses'],
    queryFn: () => adapter.getAllCourses(),
    staleTime: Infinity,
    enabled: isAuthenticated && isAdmin,
  });
}
