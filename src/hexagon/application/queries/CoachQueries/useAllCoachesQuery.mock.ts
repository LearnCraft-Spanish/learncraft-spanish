import type { UseAllCoachesQueryReturn } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { createMockCoachList } from '@testing/factories/coachFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllCoachesQueryReturn = {
  coaches: createMockCoachList(3),
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseAllCoachesQuery,
  override: overrideMockUseAllCoachesQuery,
  reset: resetMockUseAllCoachesQuery,
} = createOverrideableMock<UseAllCoachesQueryReturn>(defaultMockImplementation);

export default mockUseAllCoachesQuery;
