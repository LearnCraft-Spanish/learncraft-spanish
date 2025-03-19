import type { UpdateStudent } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useStudentDeepDiveBackend from './BackendFunctions';

export default function useAllStudents() {
  const { getAllStudents, updateStudent } = useStudentDeepDiveBackend();
  const queryClient = useQueryClient();

  const allStudentsQuery = useQuery({
    queryKey: ['allStudents'],
    queryFn: getAllStudents,
    staleTime: Infinity,
  });

  const updateStudentMutation = useMutation({
    mutationFn: (student: UpdateStudent) => updateStudent(student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });

  return {
    allStudentsQuery,
    updateStudentMutation,
  };
}
