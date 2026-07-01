import type { UseMembershipsBySalariedCoachCurrentReportQueryReturn } from '@application/queries/AdminReportQueries/useMembershipsBySalariedCoachCurrentReportQuery';
import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockMembershipsByCoachList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: MembershipsByCoach[] =
  createMockMembershipsByCoachList(2);

const defaultMockReturn: UseMembershipsBySalariedCoachCurrentReportQueryReturn =
  {
    membershipsBySalariedCoachCurrentReportQuery: {
      data: defaultMockData,
      isLoading: false,
      isError: false,
      isSuccess: true,
      status: 'success',
    } as UseQueryResult<MembershipsByCoach[]>,
  };

export const {
  mock: mockUseMembershipsBySalariedCoachCurrentReport,
  override: overrideMockUseMembershipsBySalariedCoachCurrentReport,
  reset: resetMockUseMembershipsBySalariedCoachCurrentReport,
} = createOverrideableMock(defaultMockReturn);

export default mockUseMembershipsBySalariedCoachCurrentReport;
