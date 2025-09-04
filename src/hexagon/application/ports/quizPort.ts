import type {
  ExampleWithVocabulary,
  OfficialQuizRecord,
} from '@learncraft-spanish/shared';

export interface QuizPort {
  getOfficialQuizRecords: () => Promise<OfficialQuizRecord[]>;
  getOfficialQuizExamples: ({
    courseCode,
    quizNumber,
  }: {
    courseCode: string;
    quizNumber: number;
  }) => Promise<ExampleWithVocabulary[]>;
}
