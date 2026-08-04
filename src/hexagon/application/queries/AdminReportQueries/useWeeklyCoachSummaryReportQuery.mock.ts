import type { CoachSummary } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockCoachSummaryList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: CoachSummary[] = createMockCoachSummaryList(2);

const defaultMockReturn = {
  weeklyCoachSummaryReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<CoachSummary[]>,
};

export const {
  mock: mockUseWeeklyCoachSummaryReportQuery,
  override: overrideMockUseWeeklyCoachSummaryReportQuery,
  reset: resetMockUseWeeklyCoachSummaryReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseWeeklyCoachSummaryReportQuery;
