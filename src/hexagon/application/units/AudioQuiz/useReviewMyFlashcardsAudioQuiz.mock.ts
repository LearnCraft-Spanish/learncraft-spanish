import type { AudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz';
import { createMockAudioQuizReturn } from '@application/units/AudioQuiz/useAudioQuiz.mock';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

/**
 * Mock for useReviewMyFlashcardsAudioQuiz unit.
 * Composes from createMockAudioQuizReturn since the return type is AudioQuizReturn.
 */
const defaultMockUseReviewMyFlashcardsAudioQuiz: AudioQuizReturn =
  createMockAudioQuizReturn();

export const {
  mock: mockUseReviewMyFlashcardsAudioQuiz,
  override: overrideMockUseReviewMyFlashcardsAudioQuiz,
  reset: resetMockUseReviewMyFlashcardsAudioQuiz,
} = createOverrideableMock<AudioQuizReturn>(
  defaultMockUseReviewMyFlashcardsAudioQuiz,
);

export default mockUseReviewMyFlashcardsAudioQuiz;
