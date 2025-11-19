import type { ExamplePort } from '@application/ports/examplePort';
import type {
  CreateExamplesCommand,
  ExampleTechnical,
  ExampleWithVocabulary,
} from '@learncraft-spanish/shared';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockAdapter: ExamplePort = {
  getFilteredExamples: async () => ({
    examples: createMockExampleWithVocabularyList(3),
    totalCount: 3,
  }),
  getExamplesByIds: async () => ({
    examples: createMockExampleWithVocabularyList(2),
  }),
  getExamplesForEditingByIds: async (): Promise<{
    examples: ExampleTechnical[];
  }> => {
    // Create minimal mock data for ExampleTechnical
    // Using ExampleWithVocabulary as base since we don't have a factory for ExampleTechnical
    const baseExamples = createMockExampleWithVocabularyList(2);
    return {
      examples: baseExamples as unknown as ExampleTechnical[],
    };
  },
  searchExamplesByText: async () => ({
    examples: createMockExampleWithVocabularyList(5),
  }),
  createExamples: async (
    _exampleCreates: CreateExamplesCommand,
  ): Promise<ExampleWithVocabulary[]> => {
    return createMockExampleWithVocabularyList(1);
  },
  updateExamples: async (
    _exampleEdits: any,
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
