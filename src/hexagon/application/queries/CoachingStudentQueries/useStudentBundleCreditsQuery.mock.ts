import type { UseStudentBundleCreditsQueryReturn } from '@application/queries/CoachingStudentQueries/useStudentBundleCreditsQuery';
import type { BundleCredit } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockBundleCreditList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseStudentBundleCreditsQueryReturn = {
  studentBundleCreditsQuery: {
    data: createMockBundleCreditList(2),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<BundleCredit[]>,
};

export const {
  mock: mockUseStudentBundleCreditsQuery,
  override: overrideMockUseStudentBundleCreditsQuery,
  reset: resetMockUseStudentBundleCreditsQuery,
} = createOverrideableMockHook<
  [srStudentId: number],
  UseStudentBundleCreditsQueryReturn
>(defaultMockImplementation);

export default mockUseStudentBundleCreditsQuery;
