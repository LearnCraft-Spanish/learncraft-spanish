import type { WeeklyRecordsPort } from '@application/ports/weeklyRecordsPort';
import {
  createMockBaseWeekList,
  createMockFurnishedWeekWithCoachList,
} from '@testing/factories/weekFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockWeeklyRecordsAdapter: WeeklyRecordsPort = {
  getWeeksByStartDate: async () => createMockFurnishedWeekWithCoachList(3),
  updateWeeks: async (weeks) => createMockBaseWeekList(weeks.length || 1),
};

export const {
  mock: mockWeeklyRecordsAdapter,
  override: overrideMockWeeklyRecordsAdapter,
  reset: resetMockWeeklyRecordsAdapter,
} = createOverrideableMock<WeeklyRecordsPort>(defaultMockWeeklyRecordsAdapter);

export default mockWeeklyRecordsAdapter;
