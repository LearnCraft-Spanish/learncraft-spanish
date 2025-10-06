import type {
  ExampleWithVocabulary,
  OfficialQuizRecord,
} from '@learncraft-spanish/shared';

export interface OfficialQuizPort {
  getOfficialQuizRecords: () => Promise<OfficialQuizRecord[]>;
  getOfficialQuizExamples: ({
    courseCode,
    quizNumber,
  }: {
    courseCode: string;
    quizNumber: number;
  }) => Promise<ExampleWithVocabulary[]>;
}
