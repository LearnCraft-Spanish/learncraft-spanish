import type { WeeklyTimeCommitmentByCoach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockWeeklyTimeCommitmentByCoachList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: WeeklyTimeCommitmentByCoach[] =
  createMockWeeklyTimeCommitmentByCoachList(2);

const defaultMockReturn = {
  weeklyTimeCommitmentByCoachReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<WeeklyTimeCommitmentByCoach[]>,
};

export const {
  mock: mockUseWeeklyTimeCommitmentByCoachReportQuery,
  override: overrideMockUseWeeklyTimeCommitmentByCoachReportQuery,
  reset: resetMockUseWeeklyTimeCommitmentByCoachReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseWeeklyTimeCommitmentByCoachReportQuery;
