import type { UseIncompleteWeeksForCoachReturn } from '@application/units/useIncompleteWeeksForCoach/useIncompleteWeeksForCoach';
import { createMockFurnishedWeekWithCoachList } from '@testing/factories/weekFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseIncompleteWeeksForCoachReturn = {
  weeks: createMockFurnishedWeekWithCoachList(3),
  startDate: '2026-07-05',
  loading: false,
  error: null,
  refetch: () => {},
};

export const {
  mock: mockUseIncompleteWeeksForCoach,
  override: overrideMockUseIncompleteWeeksForCoach,
  reset: resetMockUseIncompleteWeeksForCoach,
} = createOverrideableMock<UseIncompleteWeeksForCoachReturn>(
  defaultMockImplementation,
);

export default mockUseIncompleteWeeksForCoach;
