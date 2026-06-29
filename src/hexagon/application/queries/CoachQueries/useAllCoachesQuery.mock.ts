import type { UseAllCoachesQueryReturn } from '@application/queries/CoachQueries/useAllCoachesQuery';
import type { Coach } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockCoachList } from '@testing/factories/coachFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllCoachesQueryReturn = {
  allCoachesQuery: {
    data: createMockCoachList(3),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<Coach[]>,
};

export const {
  mock: mockUseAllCoachesQuery,
  override: overrideMockUseAllCoachesQuery,
  reset: resetMockUseAllCoachesQuery,
} = createOverrideableMock<UseAllCoachesQueryReturn>(defaultMockImplementation);

export default mockUseAllCoachesQuery;
