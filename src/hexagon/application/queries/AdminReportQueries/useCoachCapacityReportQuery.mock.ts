import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockCoachCapacityReportRowList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: CoachCapacityReportRow[] =
  createMockCoachCapacityReportRowList(2);

const defaultMockReturn = {
  coachCapacityReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<CoachCapacityReportRow[]>,
};

export const {
  mock: mockUseCoachCapacityReportQuery,
  override: overrideMockUseCoachCapacityReportQuery,
  reset: resetMockUseCoachCapacityReportQuery,
} = createOverrideableMock(defaultMockReturn);

export default mockUseCoachCapacityReportQuery;
