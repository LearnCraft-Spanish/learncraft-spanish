import type { ExamplePort } from '@application/ports/examplePort';
import type {
  CreateExamplesCommand,
  ExampleWithVocabulary,
  UpdateExamplesCommand,
} from '@learncraft-spanish/shared';
import {
  createMockExampleTechnicalList,
  createMockExampleWithVocabularyList,
} from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockAdapter: ExamplePort = {
  getFilteredExamples: async () => ({
    examples: createMockExampleWithVocabularyList(3),
    totalCount: 3,
  }),
  getExamplesByIds: async () => createMockExampleWithVocabularyList(2),
  getExamplesForEditingByIds: async () => createMockExampleTechnicalList(2),
  searchExamplesByText: async () => ({
    examples: createMockExampleWithVocabularyList(5),
    totalCount: 5,
  }),
  getExamplesByRecentlyModified: async () => createMockExampleTechnicalList(2),
  createExamples: async (
    _exampleCreates: CreateExamplesCommand,
  ): Promise<ExampleWithVocabulary[]> => {
    return createMockExampleWithVocabularyList(1);
  },
  updateExamples: async (
    _exampleEdits: UpdateExamplesCommand,
  ): Promise<ExampleWithVocabulary[]> => {
    return createMockExampleWithVocabularyList(1);
  },
  deleteExamples: async (_exampleIds: number[]): Promise<number[]> => {
    return [1, 2, 3];
  },
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockExampleAdapter,
  override: overrideMockExampleAdapter,
  reset: resetMockExampleAdapter,
} = createOverrideableMock<ExamplePort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockExampleAdapter;
