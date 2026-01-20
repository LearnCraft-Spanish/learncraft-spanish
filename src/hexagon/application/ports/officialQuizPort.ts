import type {
  ExampleWithVocabulary,
  OfficialQuizRecord,
} from '@learncraft-spanish/shared';

export interface OfficialQuizPort {
  getOfficialQuizRecords: () => Promise<OfficialQuizRecord[]>;
  getOfficialQuizExamples: ({
    courseCode,
    quizNumber,
    vocabularyComplete,
  }: {
    courseCode: string;
    quizNumber: number;
    vocabularyComplete?: boolean;
  }) => Promise<ExampleWithVocabulary[]>;
}
