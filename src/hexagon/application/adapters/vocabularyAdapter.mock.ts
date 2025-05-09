import type { VocabularyPort } from '@application/ports/vocabularyPort';
import type {
  CreateNonVerbVocabulary,
  CreateVerb,
} from '@LearnCraft-Spanish/shared';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// Create a default mock implementation
const defaultMockAdapter: VocabularyPort = {
  getVocabulary: () => Promise.resolve(createMockVocabularyList(3)),
  getVocabularyById: (id: string) =>
    Promise.resolve(createMockVocabulary({ id: Number.parseInt(id) })),
  getVocabularyCount: () => Promise.resolve({ total: 10 }),
  createVerb: (command: CreateVerb) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  createNonVerbVocabulary: (command: CreateNonVerbVocabulary) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  createVocabularyBatch: (commands: CreateNonVerbVocabulary[]) =>
    Promise.resolve(
      commands.map((cmd, i) => createMockVocabulary({ ...cmd, id: i })),
    ),
  deleteVocabulary: () => Promise.resolve(),
  searchVocabulary: (query: string) =>
    Promise.resolve(createMockVocabularyList(2, { word: query })),
};

// Create a single typed mock for the entire adapter hook
export const mockVocabularyAdapter =
  createTypedMock<() => VocabularyPort>().mockReturnValue(defaultMockAdapter);

// Override function with simpler type definition
export const overrideMockVocabularyAdapter = (
  config: Partial<VocabularyPort> = {},
) => {
  const mockResult = {
    ...defaultMockAdapter,
    ...config,
  };
  mockVocabularyAdapter.mockReturnValue(mockResult);
  return mockResult;
};

// Export the default mock for global mocking
export default mockVocabularyAdapter;
