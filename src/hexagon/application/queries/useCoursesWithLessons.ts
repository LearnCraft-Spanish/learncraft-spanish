import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';
import { useActiveStudent } from '../coordinators/hooks/useActiveStudent';

export function useCoursesWithLessons() {
  const adapter = useCourseAdapter();
  const { isAuthenticated, isAdmin } = useAuthAdapter();
  const { appUser, isLoading } = useActiveStudent();

  return useQuery({
    queryKey: ['coursesWithLessons'],
    queryFn: () => {
      // Subjunctives Challenge course is only accessible to admins & students currently enrolled in the course
      if (!isAdmin && appUser?.courseId !== 10) {
        return adapter
          .getCoursesWithLessons()
          .then((courses) => courses.filter((course) => course.id !== 10));
      }
      return adapter.getCoursesWithLessons();
    },
    staleTime: Infinity,
    enabled: isAuthenticated && !isLoading,
  });
}
