import type {
  BundleCredit,
  UpdateBundleCreditCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { STUDENT_BUNDLE_CREDITS_QUERY_KEY } from '@application/queries/CoachingStudentQueries/useStudentBundleCreditsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseUpdateBundleCreditMutationReturn {
  updateBundleCreditMutation: UseMutationResult<
    BundleCredit,
    Error,
    UpdateBundleCreditCommand
  >;
}

export function useUpdateBundleCreditMutation(
  studentId: number,
): UseUpdateBundleCreditMutationReturn {
  const adapter = useCoachingStudentsAdapter();
  const queryClient = useQueryClient();

  const updateBundleCreditMutation = useMutation({
    mutationFn: (cmd: UpdateBundleCreditCommand) =>
      adapter.updateBundleCredit(cmd),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: STUDENT_BUNDLE_CREDITS_QUERY_KEY(studentId),
      });
    },
  });

  return { updateBundleCreditMutation };
}
