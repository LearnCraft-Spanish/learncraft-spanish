import type { UseWeeksByStartDateResult } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { createMockFurnishedWeekWithCoachList } from '@testing/factories/weekFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const mockWeeks = createMockFurnishedWeekWithCoachList(3);

const defaultMockImplementation: UseWeeksByStartDateResult = {
  weeks: mockWeeks,
  loading: false,
  error: null,
  refetch: () => {},
  getWeekById: (weekId) => mockWeeks.find((w) => w.weekId === weekId),
};

export const {
  mock: mockUseWeeksByStartDate,
  override: overrideMockUseWeeksByStartDate,
  reset: resetMockUseWeeksByStartDate,
} = createOverrideableMock<UseWeeksByStartDateResult>(
  defaultMockImplementation,
);

export default mockUseWeeksByStartDate;
