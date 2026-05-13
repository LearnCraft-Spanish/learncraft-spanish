import type {
  EditableStudent,
  NewStudent,
  Student,
} from '@learncraft-spanish/shared';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useStudentsAdapter } from '@application/adapters/studentsAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const STUDENTS_QUERY_KEY = ['students'] as const;

export interface UseStudentsQueryReturn {
  studentsQuery: UseQueryResult<Student[]>;
  createStudentMutation: UseMutationResult<Student, Error, NewStudent>;
  updateStudentMutation: UseMutationResult<Student, Error, EditableStudent>;
}

export function useStudentsQuery(): UseStudentsQueryReturn {
  const adapter = useStudentsAdapter();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: () => adapter.getStudents(),
    staleTime: Infinity,
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: NewStudent) => adapter.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: (data: EditableStudent) => adapter.updateStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });

  return {
    studentsQuery,
    createStudentMutation,
    updateStudentMutation,
  };
}
