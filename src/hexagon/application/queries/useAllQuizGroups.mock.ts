import type { UseAllQuizGroupsReturn } from '@application/queries/useAllQuizGroups';
import { createMockQuizGroupList } from '@testing/factories/quizFactory';

import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockImplementation: UseAllQuizGroupsReturn = {
  quizGroups: createMockQuizGroupList(2)(),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseAllQuizGroups,
  override: overrideMockUseAllQuizGroups,
  reset: resetMockUseAllQuizGroups,
} = createOverrideableMock<UseAllQuizGroupsReturn>(defaultMockImplementation);

// Export the default mock for global mocking
export default mockUseAllQuizGroups;
