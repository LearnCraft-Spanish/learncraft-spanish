import type { CourseWithLessons } from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useQuery } from '@tanstack/react-query';
export interface UseCoursesWithLessonsReturn {
  data: CourseWithLessons[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
export function useCoursesWithLessons(): UseCoursesWithLessonsReturn {
  const adapter = useCourseAdapter();
  const { isAuthenticated, isAdmin, isCoach } = useAuthAdapter();
  const { appUser, isLoading } = useActiveStudent();

  return useQuery({
    queryKey: ['publishedCoursesWithLessons'],
    queryFn: () => {
      return adapter.getPublishedCoursesWithLessons().then((courses) => {
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
