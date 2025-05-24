import type { VocabularyPort } from '@application/ports/vocabularyPort';
import type {
  CreateNonVerbVocabulary,
  CreateVerb,
} from '@LearnCraft-Spanish/shared';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

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

// Create an overrideable mock with the default implementation
export const {
  mock: mockVocabularyAdapter,
  override: overrideMockVocabularyAdapter,
  reset: resetMockVocabularyAdapter,
} = createOverrideableMock<VocabularyPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockVocabularyAdapter;
