import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates';
import type { TextQuizReturn } from '@application/units/useTextQuiz';
import mockUseStudentFlashcardUpdates from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates.mock';
import { createMockTextQuizReturn } from '@application/units/useTextQuiz/useTextQuiz.mock';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

export interface UseSrsTextQuizReturn {
  TextQuizReturn: TextQuizReturn;
  srsQuizProps: UseStudentFlashcardUpdatesReturn;
}

/**
 * Mock for useSrsTextQuiz useCase.
 * Composes from createMockTextQuizReturn and mockUseStudentFlashcardUpdates.
 */
const defaultMockUseSrsTextQuiz: UseSrsTextQuizReturn = {
  TextQuizReturn: createMockTextQuizReturn(),
  srsQuizProps: mockUseStudentFlashcardUpdates,
};

export const {
  mock: mockUseSrsTextQuiz,
  override: overrideMockUseSrsTextQuiz,
  reset: resetMockUseSrsTextQuiz,
} = createOverrideableMock<UseSrsTextQuizReturn>(defaultMockUseSrsTextQuiz);

export default mockUseSrsTextQuiz;
