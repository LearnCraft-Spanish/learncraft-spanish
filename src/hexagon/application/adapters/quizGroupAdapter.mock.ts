import type { QuizGroupPort } from '@application/ports/quizGroupPort';
import { createMockQuizGroupList } from '@testing/factories/quizFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdapter: QuizGroupPort = {
  getAllQuizGroups: () => {
    return Promise.resolve(createMockQuizGroupList(2)());
  },
};

export const {
  mock: mockQuizGroupAdapter,
  override: overrideMockQuizGroupAdapter,
  reset: resetMockQuizGroupAdapter,
} = createOverrideableMock<QuizGroupPort>(defaultMockAdapter);

export default mockQuizGroupAdapter;
