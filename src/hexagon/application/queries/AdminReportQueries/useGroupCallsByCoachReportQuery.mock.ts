import type { GroupCallsByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockGroupCallsByCoachList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: GroupCallsByCoach[] = createMockGroupCallsByCoachList(2);

const defaultMockReturn = {
  groupCallsByCoachReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<GroupCallsByCoach[]>,
};

export const {
  mock: mockUseGroupCallsByCoachReportQuery,
  override: overrideMockUseGroupCallsByCoachReportQuery,
  reset: resetMockUseGroupCallsByCoachReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseGroupCallsByCoachReportQuery;
