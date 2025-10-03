import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useQuery } from '@tanstack/react-query';
import { useActiveStudent } from '../coordinators/hooks/useActiveStudent';

export function useCoursesWithLessons() {
  const adapter = useCourseAdapter();
  const { isAuthenticated, isAdmin, isCoach } = useAuthAdapter();
  const { appUser, isLoading } = useActiveStudent();

  return useQuery({
    queryKey: ['coursesWithLessons'],
    queryFn: () => {
      return adapter.getCoursesWithLessons().then((courses) => {
        // Filter out the Subjunctives Challenge course for non-admin/coach users
        // and users not enrolled in the course
        if (isAdmin || isCoach || appUser?.courseId === 10) {
          return courses;
        } else {
          return courses.filter((course) => course.id !== 10);
        }
      });
    },

    staleTime: Infinity,
    enabled: isAuthenticated && !isLoading,
  });
}
