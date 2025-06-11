import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';

export function useCoursesWithLessons() {
  const adapter = useCourseAdapter();
  return useQuery({
    queryKey: ['coursesWithLessons'],
    queryFn: () => adapter.getCoursesWithLessons(),
    staleTime: Infinity,
  });
}
