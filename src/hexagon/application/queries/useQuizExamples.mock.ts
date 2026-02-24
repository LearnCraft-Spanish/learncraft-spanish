import type { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

export interface UseQuizExamplesReturn {
  data: ReturnType<typeof createMockExampleWithVocabularyList> | undefined;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}

// Create a default mock implementation
const defaultMockImplementation: UseQuizExamplesReturn = {
  data: undefined,
  isLoading: false,
  error: null,
  isFetching: false,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseQuizExamples,
  override: overrideMockUseQuizExamples,
  reset: resetMockUseQuizExamples,
} = createOverrideableMock<UseQuizExamplesReturn>(defaultMockImplementation);

// Export the default mock for global mocking
export default mockUseQuizExamples;
