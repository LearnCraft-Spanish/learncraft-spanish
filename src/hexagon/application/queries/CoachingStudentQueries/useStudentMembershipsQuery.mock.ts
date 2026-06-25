import type { UseStudentMembershipsQueryReturn } from '@application/queries/CoachingStudentQueries/useStudentMembershipsQuery';
import type { StudentMembership } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockStudentMembershipList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseStudentMembershipsQueryReturn = {
  studentMembershipsQuery: {
    data: createMockStudentMembershipList(2),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<StudentMembership[]>,
};

export const {
  mock: mockUseStudentMembershipsQuery,
  override: overrideMockUseStudentMembershipsQuery,
  reset: resetMockUseStudentMembershipsQuery,
} = createOverrideableMockHook<
  [srStudentId: number],
  UseStudentMembershipsQueryReturn
>(defaultMockImplementation);

export default mockUseStudentMembershipsQuery;
