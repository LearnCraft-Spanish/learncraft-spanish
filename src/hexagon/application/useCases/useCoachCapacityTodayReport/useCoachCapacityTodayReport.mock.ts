import type { UseCoachCapacityTodayReportResult } from '@application/useCases/useCoachCapacityTodayReport/useCoachCapacityTodayReport';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseCoachCapacityTodayReportResult = {
  rows: [],
  columns: [],
  isLoading: false,
  isError: false,
};

export const {
  mock: mockUseCoachCapacityTodayReport,
  override: overrideMockUseCoachCapacityTodayReport,
  reset: resetMockUseCoachCapacityTodayReport,
} = createOverrideableMockHook<[], UseCoachCapacityTodayReportResult>(
  defaultMockResult,
);

export default mockUseCoachCapacityTodayReport;
