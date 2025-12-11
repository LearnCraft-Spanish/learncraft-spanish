import type { OfficialQuizRecord } from '@learncraft-spanish/shared';
import { createMockOfficialQuizRecordList } from '@testing/factories/quizFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

interface UseOfficialQuizzesQueryReturn {
  officialQuizRecords: OfficialQuizRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Create a default mock implementation
const defaultMockImplementation: UseOfficialQuizzesQueryReturn = {
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
