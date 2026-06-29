import type { DeleteBundleCreditCommand } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { STUDENT_BUNDLE_CREDITS_QUERY_KEY } from '@application/queries/CoachingStudentQueries/useStudentBundleCreditsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseDeleteBundleCreditMutationReturn {
  deleteBundleCreditMutation: UseMutationResult<
    number,
    Error,
    DeleteBundleCreditCommand
  >;
}

export function useDeleteBundleCreditMutation(
  studentId: number,
): UseDeleteBundleCreditMutationReturn {
  const adapter = useCoachingStudentsAdapter();
  const queryClient = useQueryClient();

  const deleteBundleCreditMutation = useMutation({
    mutationFn: (cmd: DeleteBundleCreditCommand) =>
      adapter.deleteBundleCredit(cmd),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: STUDENT_BUNDLE_CREDITS_QUERY_KEY(studentId),
      });
    },
  });

  return { deleteBundleCreditMutation };
}
