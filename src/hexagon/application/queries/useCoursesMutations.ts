import type { CourseDetailed } from '@learncraft-spanish/shared';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseCoursesUpdateReturn {
  updateCourses: (courses: CourseDetailed[]) => Promise<CourseDetailed[]>;
  isPending: boolean;
  error: Error | null;
}

export function useCoursesMutations(): UseCoursesUpdateReturn {
  const adapter = useCourseAdapter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (courses: CourseDetailed[]) => adapter.updateCourses(courses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      console.error(
        `Failed to update courses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  return {
    updateCourses: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
