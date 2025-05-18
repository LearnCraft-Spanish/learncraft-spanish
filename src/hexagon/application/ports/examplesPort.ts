import type {
  CreateExampleRecord,
  ExampleRecord,
  UpdateExampleRecord,
} from '@LearnCraft-Spanish/shared';

export interface ExamplesPort {
  getExample: (id: number) => Promise<ExampleRecord>;
  createUnverifiedExample: (
    example: CreateExampleRecord,
  ) => Promise<ExampleRecord>;
  updateExample: (example: UpdateExampleRecord) => Promise<number>;
  addVocabularyToExample: (
    exampleId: number,
    vocabIdList: number[],
  ) => Promise<number>;
  removeVocabularyFromExample: (
    exampleId: number,
    vocabIdList: number[],
  ) => Promise<number>;
  getRecentlyEditedExamples: () => Promise<ExampleRecord[]>;
  getExampleSetBySpanishText: (
    spanishText: string[],
  ) => Promise<ExampleRecord[]>;
  getUnverifiedExamples: () => Promise<ExampleRecord[]>;
}
