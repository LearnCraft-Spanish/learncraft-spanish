import type {
  CreateNonVerbVocabulary,
  CreateVerbVocabulary,
} from '@learncraft-spanish/shared';
import type { UseVocabularyResult } from './useVocabulary';
import {
  createMockVocabulary,
  createMockVocabularyAbbreviationList,
} from '@testing/factories/vocabularyFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Default mock implementation matching the interface exactly
const defaultMockResult: UseVocabularyResult = {
  // Read operations
  vocabulary: createMockVocabularyAbbreviationList(),
  loading: false,
  error: null,
  getById: (_id: string) => Promise.resolve(createMockVocabulary()),

  // Write operations
  createVerbVocabulary: (_command: CreateVerbVocabulary[]) =>
    Promise.resolve([1, 2, 3]),
  createNonVerbVocabulary: (_command: CreateNonVerbVocabulary[]) =>
    Promise.resolve([1, 2, 3]),
  deleteVocabulary: (_id: string[]) => Promise.resolve(1),
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
