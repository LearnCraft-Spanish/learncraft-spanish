import type { CourseDetailed } from '@learncraft-spanish/shared';
import { useCourseAdapter } from '@application/adapters/courseAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

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
      toast.success('Programs updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      toast.error(
        `Failed to update programs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  return {
    updateCourses: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
