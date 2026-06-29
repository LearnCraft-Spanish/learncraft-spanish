import type { WeeksPort } from '@application/ports/weeksPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockWeeksAdapter: WeeksPort = {
  getMembershipWeeks: async () => [],
};

export const {
  mock: mockWeeksAdapter,
  override: overrideMockWeeksAdapter,
  reset: resetMockWeeksAdapter,
} = createOverrideableMock<WeeksPort>(defaultMockWeeksAdapter);

export default mockWeeksAdapter;
