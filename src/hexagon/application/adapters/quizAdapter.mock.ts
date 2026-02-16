import type { QuizPort } from '@application/ports/quizPort';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: QuizPort = {
  getQuizExamples: () => {
    return Promise.resolve(createMockExampleWithVocabularyList(5));
  },
};

export const {
  mock: mockQuizAdapter,
  override: overrideMockQuizAdapter,
  reset: resetMockQuizAdapter,
} = createOverrideableMock<QuizPort>(defaultMockAdapter);

export default mockQuizAdapter;
