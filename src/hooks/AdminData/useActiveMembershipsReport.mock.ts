import type { UseActiveMembershipsReportQueryReturn } from '@application/queries/AdminReportQueries/useActiveMembershipsReportQuery';
import type { ActiveMembershipsByCourse } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockActiveMembershipsByCourseList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: ActiveMembershipsByCourse[] =
  createMockActiveMembershipsByCourseList(2);

const defaultMockReturn: UseActiveMembershipsReportQueryReturn = {
  activeMembershipsReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<ActiveMembershipsByCourse[]>,
};

export const {
  mock: mockUseActiveMembershipsReport,
  override: overrideMockUseActiveMembershipsReport,
  reset: resetMockUseActiveMembershipsReport,
} = createOverrideableMock(defaultMockReturn);

export default mockUseActiveMembershipsReport;
