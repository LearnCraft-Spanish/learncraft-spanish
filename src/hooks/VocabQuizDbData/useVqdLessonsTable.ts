// used in Coaching interfaces

import type {
  LessonObjForUpdate,
  NewLesson,
} from 'src/components/DatabaseTables/VocabQuizDb/VqdLessonsTable/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../useBackend';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useVqdLessonsTable() {
  const { getVqdLessonsTable } = useVocabQuizDbBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const vqdLessonsTableQuery = useQuery({
    queryKey: ['vqd-lessons-table'],
    queryFn: getVqdLessonsTable,
    staleTime: Infinity,
  });

  const createLessonMutation = useMutation({
    mutationFn: (lesson: NewLesson) => {
      const promise = newPostFactory<NewLesson>({
        path: 'vocab-quiz/lessons',
        body: lesson,
      });

      toast.promise(promise, {
        pending: 'Creating lesson...',
        success: 'Lesson created successfully',
        error: 'Failed to create lesson',
      });

      return promise;
    },
    onSuccess: () => {
      vqdLessonsTableQuery.refetch();
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (lesson: LessonObjForUpdate) => {
      const promise = newPutFactory<LessonObjForUpdate>({
        path: 'vocab-quiz/lessons',
        body: lesson,
      });

      toast.promise(promise, {
        pending: 'Updating lesson...',
        success: 'Lesson updated successfully',
        error: 'Failed to update lesson',
      });

      return promise;
    },
    onSuccess: () => {
      vqdLessonsTableQuery.refetch();
    },
  });

  return {
    vqdLessonsTableQuery,
    createLessonMutation,
    updateLessonMutation,
  };
}
