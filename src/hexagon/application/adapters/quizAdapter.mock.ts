import type { QuizPort } from '@application/ports/quizPort';

import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockOfficialQuizRecordList } from '@testing/factories/quizFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation matching the QuizPort exactly
const defaultMockAdapter: QuizPort = {
  getOfficialQuizRecords: () =>
    Promise.resolve(createMockOfficialQuizRecordList(3)()),
  getOfficialQuizExamples: (_args: {
    courseCode: string;
    quizNumber: number;
  }) => Promise.resolve(createMockExampleWithVocabularyList(3)()),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockQuizAdapter,
  override: overrideMockQuizAdapter,
  reset: resetMockQuizAdapter,
} = createOverrideableMock<QuizPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockQuizAdapter;
