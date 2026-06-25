import type { UseUpdateBundleCreditMutationReturn } from '@application/queries/CoachingStudentQueries/useUpdateBundleCreditMutation';
import type {
  BundleCredit,
  UpdateBundleCreditCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createMockBundleCredit } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseUpdateBundleCreditMutationReturn = {
  updateBundleCreditMutation: {
    data: createMockBundleCredit(),
    isIdle: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    mutate: () => {},
    mutateAsync: async () => createMockBundleCredit(),
    reset: () => {},
    status: 'success',
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    submittedAt: 0,
  } as unknown as UseMutationResult<
    BundleCredit,
    Error,
    UpdateBundleCreditCommand
  >,
};

export const {
  mock: mockUseUpdateBundleCreditMutation,
  override: overrideMockUseUpdateBundleCreditMutation,
  reset: resetMockUseUpdateBundleCreditMutation,
} = createOverrideableMockHook<
  [studentId: number],
  UseUpdateBundleCreditMutationReturn
>(defaultMockImplementation);

export default mockUseUpdateBundleCreditMutation;
