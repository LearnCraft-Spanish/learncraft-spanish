import type { TextQuizReturn } from '@application/units/useTextQuiz';
import { createMockTextQuizReturn } from '@application/units/useTextQuiz/useTextQuiz.mock';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

/**
 * Mock for useReviewMyFlashcardsTextQuiz useCase.
 * Composes from createMockTextQuizReturn since the return type is TextQuizReturn.
 */
const defaultMockUseReviewMyFlashcardsTextQuiz: TextQuizReturn =
  createMockTextQuizReturn();

export const {
  mock: mockUseReviewMyFlashcardsTextQuiz,
  override: overrideMockUseReviewMyFlashcardsTextQuiz,
  reset: resetMockUseReviewMyFlashcardsTextQuiz,
} = createOverrideableMock<TextQuizReturn>(
  defaultMockUseReviewMyFlashcardsTextQuiz,
);

export default mockUseReviewMyFlashcardsTextQuiz;
