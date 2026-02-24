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

function filterSubjunctivesCourseForNonEligible(
  courses: CourseWithLessons[],
  isAdmin: boolean,
  isCoach: boolean,
  appUserCourseId: number | undefined,
): CourseWithLessons[] {
  if (isAdmin || isCoach || appUserCourseId === 10) {
    return courses;
  }
  return courses.filter((course) => course.id !== 10);
}

export function useCoursesWithLessons(
  includeUnpublished?: boolean,
): UseCoursesWithLessonsReturn {
  const adapter = useCourseAdapter();
  const { isAuthenticated, isAdmin, isCoach } = useAuthAdapter();
  const { appUser, isLoading } = useActiveStudent();

  return useQuery({
    queryKey: [
      'coursesWithLessons',
      { includeUnpublished: !!includeUnpublished },
    ],
    queryFn: () => {
      const fetch = includeUnpublished
        ? adapter.getAllCoursesWithLessons()
        : adapter.getPublishedCoursesWithLessons();
      return fetch.then((courses) =>
        filterSubjunctivesCourseForNonEligible(
          courses,
          isAdmin,
          isCoach,
          appUser?.courseId,
        ),
      );
    },
    staleTime: Infinity,
    enabled: isAuthenticated && !isLoading,
  });
}
