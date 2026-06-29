import type { UseDeleteBundleCreditMutationReturn } from '@application/queries/CoachingStudentQueries/useDeleteBundleCreditMutation';
import type { DeleteBundleCreditCommand } from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseDeleteBundleCreditMutationReturn = {
  deleteBundleCreditMutation: {
    data: 1,
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => 1,
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<number, Error, DeleteBundleCreditCommand>,
};

export const {
  mock: mockUseDeleteBundleCreditMutation,
  override: overrideMockUseDeleteBundleCreditMutation,
  reset: resetMockUseDeleteBundleCreditMutation,
} = createOverrideableMockHook<
  [studentId: number],
  UseDeleteBundleCreditMutationReturn
>(defaultMockImplementation);

export default mockUseDeleteBundleCreditMutation;
