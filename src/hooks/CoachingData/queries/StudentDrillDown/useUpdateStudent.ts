import type { UpdateStudent } from 'src/types/CoachingTypes';
import { ALL_COACHING_STUDENTS_QUERY_KEY } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useStudentDrillDownBackend from './BackendFunctions';

export interface UseUpdateStudentReturn {
  updateStudentMutation: ReturnType<
    typeof useMutation<unknown, Error, UpdateStudent>
  >;
}

export default function useUpdateStudent(): UseUpdateStudentReturn {
  const { updateStudent } = useStudentDrillDownBackend();
  const queryClient = useQueryClient();

  const updateStudentMutation = useMutation({
    mutationFn: (student: UpdateStudent) => updateStudent(student),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ALL_COACHING_STUDENTS_QUERY_KEY,
      });
    },
  });

  return { updateStudentMutation };
}
