import type { UseAllCoachesByStudentReturnType } from '@application/queries/CoachQueries/useAllCoachesByStudent';
import { createMockCoachCallCountList } from '@testing/factories/coachFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

// Create a default mock implementation
const defaultMockImplementation: UseAllCoachesByStudentReturnType = {
  data: createMockCoachCallCountList(3),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseAllCoachesByStudent,
  override: overrideMockUseAllCoachesByStudent,
  reset: resetMockUseAllCoachesByStudent,
} = createOverrideableMockHook<
  [studentId: number],
  UseAllCoachesByStudentReturnType
>(defaultMockImplementation);

// Export the default mock for global mocking
export default mockUseAllCoachesByStudent;
