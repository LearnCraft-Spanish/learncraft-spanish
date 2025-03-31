import type {
  EditableStudent,
  NewStudent,
} from 'src/components/VocabQuizDbTables/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useProgramTable } from '../CourseData/useProgramTable';
import { useBackendHelpers } from '../useBackend';

import useVocabQuizDbBackend from './queries/BackendFunctions';

export default function useStudentsTable() {
  const { getStudentsTable, getStudentsTableCohortFieldOptions } =
    useVocabQuizDbBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const { programTableQuery } = useProgramTable();

  const studentsTableQuery = useQuery({
    queryKey: ['students-table'],
    queryFn: getStudentsTable,
    staleTime: Infinity,
  });

  const cohortFieldOptionsQuery = useQuery({
    queryKey: ['cohort-field-options'],
    queryFn: getStudentsTableCohortFieldOptions,
    staleTime: Infinity,
  });

  const updateStudentMutation = useMutation({
    mutationFn: (student: EditableStudent) => {
      const promise = newPutFactory<EditableStudent>({
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
    mutationFn: (student: NewStudent) => {
      const promise = newPostFactory<NewStudent>({
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
    cohortFieldOptionsQuery,
    programTableQuery,
    updateStudentMutation,
    createStudentMutation,
  };
}
