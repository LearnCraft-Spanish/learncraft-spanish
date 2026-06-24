import type {
  CoachingStudent,
  UpdateCoachingStudentCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { ALL_COACHING_STUDENTS_QUERY_KEY } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseUpdateCoachingStudentMutationReturn {
  updateCoachingStudentMutation: UseMutationResult<
    CoachingStudent,
    Error,
    UpdateCoachingStudentCommand
  >;
}

export function useUpdateCoachingStudentMutation(): UseUpdateCoachingStudentMutationReturn {
  const adapter = useCoachingStudentsAdapter();
  const queryClient = useQueryClient();

  const updateCoachingStudentMutation = useMutation({
    mutationFn: (cmd: UpdateCoachingStudentCommand) =>
      adapter.updateCoachingStudent(cmd),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ALL_COACHING_STUDENTS_QUERY_KEY,
      });
    },
  });

  return { updateCoachingStudentMutation };
}
