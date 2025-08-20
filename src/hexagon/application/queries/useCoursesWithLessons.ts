import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export function useCoursesWithLessons() {
  const adapter = useCourseAdapter();
  const { isAuthenticated } = useAuthAdapter();
  return useQuery({
    queryKey: ['coursesWithLessons'],
    queryFn: () => adapter.getCoursesWithLessons(),
    staleTime: Infinity,
    enabled: isAuthenticated,
  });
}
