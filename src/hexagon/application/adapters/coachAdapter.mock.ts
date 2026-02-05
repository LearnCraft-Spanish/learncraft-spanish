import type { CoachPort } from '@application/ports/coachPort';
import { createMockCoachCallCountList } from '@testing/factories/coachFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
export const defaultMockCoachAdapter: CoachPort = {
  getAllCoachesByStudent: async () => createMockCoachCallCountList(3),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockCoachAdapter,
  override: overrideMockCoachAdapter,
  reset: resetMockCoachAdapter,
} = createOverrideableMock<CoachPort>(defaultMockCoachAdapter);

// Export the default mock for global mocking
export default mockCoachAdapter;
