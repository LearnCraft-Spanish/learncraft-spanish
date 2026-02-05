// used in Coaching interfaces
import type { Lesson } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useStudentRecordsBackend from './queries/BackendFunctions';

export type EditableLesson = Omit<Lesson, 'recordId'> & { recordId?: number };

export default function useLessonsTable() {
  const { updateLesson, createLesson, getLessonsTable } =
    useStudentRecordsBackend();
  const queryClient = useQueryClient();
  const lessonsTableQuery = useQuery({
    queryKey: ['lessons-table'],
    queryFn: getLessonsTable,
    staleTime: Infinity,
  });

  const updateLessonMutation = useMutation({
    mutationFn: (lesson: EditableLesson) => {
      const promise = updateLesson(lesson);
      toast.promise(promise, {
        pending: 'Updating lesson...',
        success: 'Lesson updated successfully!',
        error: 'Failed to update lesson',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-table'] });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: (lesson: EditableLesson) => {
      const promise = createLesson(lesson);
      toast.promise(promise, {
        pending: 'Creating lesson...',
        success: 'Lesson created successfully!',
        error: 'Failed to create lesson',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons-table'] });
    },
  });

  return {
    lessonsTableQuery,
    updateLessonMutation,
    createLessonMutation,
  };
}
