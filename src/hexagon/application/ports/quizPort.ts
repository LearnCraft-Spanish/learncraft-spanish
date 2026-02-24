import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

export interface QuizPort {
  getQuizExamples: ({
    quizId,
    vocabularyComplete,
  }: {
    quizId: number;
    vocabularyComplete?: boolean;
  }) => Promise<ExampleWithVocabulary[]>;
}
