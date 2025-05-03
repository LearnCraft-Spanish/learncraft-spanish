import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  Vocabulary,
} from '@LearnCraft-Spanish/shared';
import type { UseVocabularyResult } from './useVocabulary';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// Default mock implementation that provides happy-path data
const defaultMockResult: UseVocabularyResult = {
  // Read operations
  vocabulary: createMockVocabularyList(),
  loading: false,
  error: null,
  refetch: createTypedMock<() => void>().mockImplementation(() => {}),
  getById: createTypedMock<
    (id: string) => Promise<Vocabulary | null>
  >().mockImplementation((id) =>
    Promise.resolve(createMockVocabulary({ id: Number.parseInt(id) })),
  ),
  search: createTypedMock<
    (query: string) => Promise<Vocabulary[]>
  >().mockImplementation((query) =>
    Promise.resolve(createMockVocabularyList(2, { word: query })),
  ),

  // Write operations
  createVerb: createTypedMock<
    (command: CreateVerb) => Promise<Vocabulary>
  >().mockImplementation((command) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  ),
  createNonVerb: createTypedMock<
    (command: CreateNonVerbVocabulary) => Promise<Vocabulary>
  >().mockImplementation((command) =>
    Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
  ),
  createBatch: createTypedMock<
    (commands: CreateNonVerbVocabulary[]) => Promise<Vocabulary[]>
  >().mockImplementation((commands) =>
    Promise.resolve(
      commands.map((cmd, i) => createMockVocabulary({ ...cmd, id: i })),
    ),
  ),
  deleteVocabulary:
    createTypedMock<(id: string) => Promise<void>>().mockResolvedValue(
      undefined,
    ),
  creating: false,
  creationError: null,
  deleting: false,
  deletionError: null,
};

// Create the mock hook with default implementation
export const mockUseVocabulary =
  createTypedMock<() => UseVocabularyResult>().mockReturnValue(
    defaultMockResult,
  );

// Setup function to configure the mock for tests
export const overrideMockUseVocabulary = (
  config: Partial<UseVocabularyResult> = {},
) => {
  // Create a new result with defaults and overrides
  const mockResult = {
    ...defaultMockResult,
    ...config,
  };

  // Reset and configure the mock
  mockUseVocabulary.mockReturnValue(mockResult);
  return mockResult;
};

// Helper to call the mock during tests
export const callMockUseVocabulary = () => mockUseVocabulary();

// Export default for global mocking
export default mockUseVocabulary;
