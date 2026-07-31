import type { CoachSummaryDrilldown } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockCoachSummaryDrilldownList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: CoachSummaryDrilldown[] =
  createMockCoachSummaryDrilldownList(2);

const defaultMockReturn = {
  weeksDrilldownReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<CoachSummaryDrilldown[]>,
};

export const {
  mock: mockUseWeeksDrilldownReportQuery,
  override: overrideMockUseWeeksDrilldownReportQuery,
  reset: resetMockUseWeeksDrilldownReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseWeeksDrilldownReportQuery;
