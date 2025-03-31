import type { FlashcardStudent } from 'src/types/interfaceDefinitions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../useBackend';
import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useStudentsTable() {
  const { getStudentsTable } = useVocabQuizDbBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const studentsTableQuery = useQuery({
    queryKey: ['students-table'],
    queryFn: getStudentsTable,
    staleTime: Infinity,
  });

  const updateStudentMutation = useMutation({
    mutationFn: (student: FlashcardStudent) => {
      const promise = newPutFactory<FlashcardStudent>({
        path: 'vocab-quiz/students',
        body: student,
      });
      toast.promise(promise, {
        pending: 'Updating student...',
        success: 'Student updated successfully!',
        error: 'Failed to update student',
      });
      return promise;
    },
    onSuccess: () => {
      studentsTableQuery.refetch();
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (student: Omit<FlashcardStudent, 'recordId'>) => {
      const promise = newPostFactory<FlashcardStudent>({
        path: 'vocab-quiz/students',
        body: student,
      });
      toast.promise(promise, {
        pending: 'Creating student...',
        success: 'Student created successfully!',
        error: 'Failed to create student',
      });
      return promise;
    },
    onSuccess: () => {
      studentsTableQuery.refetch();
    },
  });

  return {
    studentsTableQuery,
    updateStudentMutation,
    createStudentMutation,
  };
}
