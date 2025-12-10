import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockUseStudentFlashcardUpdates: UseStudentFlashcardUpdatesReturn =
  {
    examplesReviewedResults: [],
    handleReviewExample: () => {},
    hasExampleBeenReviewed: () => null,
    flushBatch: async () => Promise.resolve(),
  };

export const {
  mock: mockUseStudentFlashcardUpdates,
  override: overrideMockUseStudentFlashcardUpdates,
  reset: resetMockUseStudentFlashcardUpdates,
} = createOverrideableMock<UseStudentFlashcardUpdatesReturn>(
  defaultMockUseStudentFlashcardUpdates,
);

// Export the default mock for global mocking
export default mockUseStudentFlashcardUpdates;
