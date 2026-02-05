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
    ignoreCache,
  }: {
    courseCode: string;
    quizNumber: number;
    vocabularyComplete?: boolean;
    ignoreCache?: boolean;
  }) => Promise<ExampleWithVocabulary[]>;
  addExamplesToOfficialQuiz: ({
    courseCode,
    quizNumber,
    exampleIds,
  }: {
    courseCode: string;
    quizNumber: number;
    exampleIds: number[];
  }) => Promise<number>;
}
