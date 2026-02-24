import type { UseOfficialQuizzesQueryReturn } from '@application/queries/useOfficialQuizzesQuery';
import {
  createMockOfficialQuizRecordList,
  createMockQuizGroupList,
} from '@testing/factories/quizFactory';

import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockImplementation: UseOfficialQuizzesQueryReturn = {
  quizGroups: createMockQuizGroupList(2)(),
  officialQuizRecords: createMockOfficialQuizRecordList(3)(),
  isLoading: false,
  error: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseOfficialQuizzesQuery,
  override: overrideMockUseOfficialQuizzesQuery,
  reset: resetMockUseOfficialQuizzesQuery,
} = createOverrideableMock<UseOfficialQuizzesQueryReturn>(
  defaultMockImplementation,
);

// Export the default mock for global mocking
export default mockUseOfficialQuizzesQuery;
