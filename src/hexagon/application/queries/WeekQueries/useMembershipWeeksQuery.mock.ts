import type { UseMembershipWeeksQueryReturn } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import type { FurnishedWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockFurnishedWeekList } from '@testing/factories/weekFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockImplementation: UseMembershipWeeksQueryReturn = {
  membershipWeeksQuery: {
    data: createMockFurnishedWeekList(3),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<FurnishedWeek[]>,
};

export const {
  mock: mockUseMembershipWeeksQuery,
  override: overrideMockUseMembershipWeeksQuery,
  reset: resetMockUseMembershipWeeksQuery,
} = createOverrideableMockHook<
  [membershipId: number],
  UseMembershipWeeksQueryReturn
>(defaultMockImplementation);

export default mockUseMembershipWeeksQuery;
