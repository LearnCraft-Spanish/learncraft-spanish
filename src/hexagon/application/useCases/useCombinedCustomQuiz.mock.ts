import type { UseCombinedCustomQuizReturn } from '@application/useCases/useCombinedCustomQuiz';
import { CombinedCustomQuizType } from '@application/useCases/useCombinedCustomQuiz';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

export const defaultMockUseCombinedCustomQuiz: UseCombinedCustomQuizReturn = {
  quizType: CombinedCustomQuizType.Text,
  setQuizType: vi.fn<(type: CombinedCustomQuizType) => void>(),
  quizReady: false,
  setQuizReady: vi.fn<(ready: boolean) => void>(),
  quizNotReady: false,
  readyQuiz: vi.fn<() => void>(),
  isLoadingExamples: false,
  isInitialLoading: false,
  totalCount: 2,
  errorExamples: null,
  textQuizSetup: {} as UseCombinedCustomQuizReturn['textQuizSetup'],
  audioQuizSetup: {} as UseCombinedCustomQuizReturn['audioQuizSetup'],
  textQuizProps: {} as UseCombinedCustomQuizReturn['textQuizProps'],
  audioQuizProps: {} as UseCombinedCustomQuizReturn['audioQuizProps'],
};

export const {
  mock: mockUseCombinedCustomQuiz,
  override: overrideMockUseCombinedCustomQuiz,
  reset: resetMockUseCombinedCustomQuiz,
} = createOverrideableMock<UseCombinedCustomQuizReturn>(
  defaultMockUseCombinedCustomQuiz,
);

export default mockUseCombinedCustomQuiz;
