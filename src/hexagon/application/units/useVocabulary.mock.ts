import type {
  CreateNonVerbVocabulary,
  CreateVerb,
} from '@LearnCraft-Spanish/shared';
import type { UseVocabularyResult } from './useVocabulary';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Default mock implementation with sensible defaults
const defaultMockResult: UseVocabularyResult = {
  // Read operations
  vocabulary: createMockVocabularyList(),
  loading: false,
  error: null,
  refetch: () => {},
  getById: (id: string) =>
    Promise.resolve(createMockVocabulary({ id: Number.parseInt(id) })),
  search: (query: string) =>
    Promise.resolve(createMockVocabularyList(2, { word: query })),

  // Write operations
  createVerb: (command: CreateVerb) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  createNonVerb: (command: CreateNonVerbVocabulary) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  createBatch: (commands: CreateNonVerbVocabulary[]) =>
    Promise.resolve(
      commands.map((cmd, i) => createMockVocabulary({ ...cmd, id: i })),
    ),
  deleteVocabulary: () => Promise.resolve(),
  creating: false,
  creationError: null,
  deleting: false,
  deletionError: null,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseVocabulary,
  override: overrideMockUseVocabulary,
  reset: resetMockUseVocabulary,
} = createOverrideableMock<UseVocabularyResult>(defaultMockResult);

// Export default for global mocking
export default mockUseVocabulary;
