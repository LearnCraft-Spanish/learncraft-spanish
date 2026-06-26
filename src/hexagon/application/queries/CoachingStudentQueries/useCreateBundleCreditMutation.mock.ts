import type { UseCreateBundleCreditMutationReturn } from '@application/queries/CoachingStudentQueries/useCreateBundleCreditMutation';
import type {
  BundleCredit,
  CreateBundleCreditCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { createMockBundleCredit } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseCreateBundleCreditMutationReturn = {
  createBundleCreditMutation: {
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
    CreateBundleCreditCommand
  >,
};

export const {
  mock: mockUseCreateBundleCreditMutation,
  override: overrideMockUseCreateBundleCreditMutation,
  reset: resetMockUseCreateBundleCreditMutation,
} = createOverrideableMockHook<
  [studentId: number],
  UseCreateBundleCreditMutationReturn
>(defaultMockImplementation);

export default mockUseCreateBundleCreditMutation;
