import type { UseRecentRecordsQueryReturn } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { createMockRecentRecords } from '@testing/factories/coachFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseRecentRecordsQueryReturn = {
  recentRecords: createMockRecentRecords(),
  isLoading: false,
  isError: false,
  isSuccess: true,
  error: null,
  refetch: () => undefined,
};

export const {
  mock: mockUseRecentRecordsQuery,
  override: overrideMockUseRecentRecordsQuery,
  reset: resetMockUseRecentRecordsQuery,
} = createOverrideableMockHook<
  [coachId: string | undefined, monthYear: string],
  UseRecentRecordsQueryReturn
>(defaultMockImplementation);

export default mockUseRecentRecordsQuery;
