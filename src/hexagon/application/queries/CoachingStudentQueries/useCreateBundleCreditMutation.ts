import type {
  BundleCredit,
  CreateBundleCreditCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter';
import { STUDENT_BUNDLE_CREDITS_QUERY_KEY } from '@application/queries/CoachingStudentQueries/useStudentBundleCreditsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UseCreateBundleCreditMutationReturn {
  createBundleCreditMutation: UseMutationResult<
    BundleCredit,
    Error,
    CreateBundleCreditCommand
  >;
}

export function useCreateBundleCreditMutation(
  studentId: number,
): UseCreateBundleCreditMutationReturn {
  const adapter = useCoachingStudentsAdapter();
  const queryClient = useQueryClient();

  const createBundleCreditMutation = useMutation({
    mutationFn: (cmd: CreateBundleCreditCommand) =>
      adapter.createBundleCredit(cmd),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: STUDENT_BUNDLE_CREDITS_QUERY_KEY(studentId),
      });
    },
  });

  return { createBundleCreditMutation };
}
