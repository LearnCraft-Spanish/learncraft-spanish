import type { Course } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useStudentRecordsBackend from './queries/BackendFunctions';

export type EditableCourse = Omit<Course, 'recordId'> & { recordId?: number };

export default function useCoursesTable() {
  const { updateCourse, createCourse, getCoursesTable } =
    useStudentRecordsBackend();
  const queryClient = useQueryClient();
  const coursesTableQuery = useQuery({
    queryKey: ['courses-table'],
    queryFn: getCoursesTable,
    staleTime: Infinity,
  });

  const updateCourseMutation = useMutation({
    mutationFn: (course: EditableCourse) => {
      const promise = updateCourse(course);
      toast.promise(promise, {
        pending: 'Updating course...',
        success: 'Course updated successfully!',
        error: 'Failed to update course',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-table'] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (course: EditableCourse) => {
      const promise = createCourse(course);
      toast.promise(promise, {
        pending: 'Creating course...',
        success: 'Course created successfully!',
        error: 'Failed to create course',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-table'] });
    },
  });

  return {
    coursesTableQuery,
    updateCourseMutation,
    createCourseMutation,
  };
}
