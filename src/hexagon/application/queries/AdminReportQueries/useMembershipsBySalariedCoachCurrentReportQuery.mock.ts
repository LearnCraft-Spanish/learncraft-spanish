import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: MembershipsByCoach[] =
  createMockMembershipsByCoachList(2);

const defaultMockReturn = {
  membershipsBySalariedCoachCurrentReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<MembershipsByCoach[]>,
};

export const {
  mock: mockUseMembershipsBySalariedCoachCurrentReportQuery,
  override: overrideMockUseMembershipsBySalariedCoachCurrentReportQuery,
  reset: resetMockUseMembershipsBySalariedCoachCurrentReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseMembershipsBySalariedCoachCurrentReportQuery;
