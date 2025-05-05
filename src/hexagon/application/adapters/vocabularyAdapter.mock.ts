import type { VocabularyPort } from '@application/ports/vocabularyPort';
import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  GetTotalCountResponse,
  Vocabulary,
} from '@LearnCraft-Spanish/shared';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from '@testing/factories/vocabularyFactories';
import { setMockResult } from '@testing/utils/setMockResult';
import { createTypedMock } from '@testing/utils/typedMock';

// Create strongly-typed spies for each VocabularyPort method
export const mockGetVocabulary = createTypedMock<
  () => Promise<Vocabulary[]>
>().mockResolvedValue(createMockVocabularyList(3));

export const mockGetVocabularyById = createTypedMock<
  (id: string) => Promise<Vocabulary | null>
>().mockImplementation((id) =>
  Promise.resolve(createMockVocabulary({ id: Number.parseInt(id) })),
);

export const mockGetVocabularyCount = createTypedMock<
  () => Promise<GetTotalCountResponse>
>().mockResolvedValue({ total: 10 });

export const mockCreateVerb = createTypedMock<
  (command: CreateVerb) => Promise<Vocabulary>
>().mockImplementation((command) =>
  Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
);

export const mockCreateNonVerbVocabulary = createTypedMock<
  (command: CreateNonVerbVocabulary) => Promise<Vocabulary>
>().mockImplementation((command) =>
  Promise.resolve(createMockVocabulary({ ...command, id: 1 })),
);

export const mockCreateVocabularyBatch = createTypedMock<
  (commands: CreateNonVerbVocabulary[]) => Promise<Vocabulary[]>
>().mockImplementation((commands) =>
  Promise.resolve(
    commands.map((cmd, i) => createMockVocabulary({ ...cmd, id: i })),
  ),
);

export const mockDeleteVocabulary =
  createTypedMock<(id: string) => Promise<void>>().mockResolvedValue(undefined);

export const mockSearchVocabulary = createTypedMock<
  (query: string) => Promise<Vocabulary[]>
>().mockImplementation((query) =>
  Promise.resolve(createMockVocabularyList(2, { word: query })),
);

// Global mock for the adapter with safe default implementations
export const mockVocabularyAdapter: VocabularyPort = {
  getVocabulary: mockGetVocabulary,
  getVocabularyById: mockGetVocabularyById,
  getVocabularyCount: mockGetVocabularyCount,
  createVerb: mockCreateVerb,
  createNonVerbVocabulary: mockCreateNonVerbVocabulary,
  createVocabularyBatch: mockCreateVocabularyBatch,
  deleteVocabulary: mockDeleteVocabulary,
  searchVocabulary: mockSearchVocabulary,
};

// Setup function for tests to override mock behavior
export const overrideMockVocabularyAdapter = (
  config: Partial<{
    getVocabulary: Awaited<ReturnType<typeof mockGetVocabulary>> | Error;
    getVocabularyById:
      | Awaited<ReturnType<typeof mockGetVocabularyById>>
      | Error;
    getVocabularyCount:
      | Awaited<ReturnType<typeof mockGetVocabularyCount>>
      | Error;
    createVerb: Awaited<ReturnType<typeof mockCreateVerb>> | Error;
    createNonVerbVocabulary:
      | Awaited<ReturnType<typeof mockCreateNonVerbVocabulary>>
      | Error;
    createVocabularyBatch:
      | Awaited<ReturnType<typeof mockCreateVocabularyBatch>>
      | Error;
    deleteVocabulary: Error; // void return type special case
    searchVocabulary: Awaited<ReturnType<typeof mockSearchVocabulary>> | Error;
  }> = {},
) => {
  setMockResult(mockGetVocabulary, config.getVocabulary);
  setMockResult(mockGetVocabularyById, config.getVocabularyById);
  setMockResult(mockGetVocabularyCount, config.getVocabularyCount);
  setMockResult(mockCreateVerb, config.createVerb);
  setMockResult(mockCreateNonVerbVocabulary, config.createNonVerbVocabulary);
  setMockResult(mockCreateVocabularyBatch, config.createVocabularyBatch);

  // Special case for void return type
  if (config.deleteVocabulary instanceof Error) {
    mockDeleteVocabulary.mockRejectedValue(config.deleteVocabulary);
  }

  setMockResult(mockSearchVocabulary, config.searchVocabulary);
};

// Always return a valid adapter mock with proper fallbacks
export const callMockVocabularyAdapter = () => {
  try {
    return mockVocabularyAdapter;
  } catch (error) {
    console.error('Error in vocabularyAdapter mock, returning fallback', error);
    // Create a fresh adapter mock with defaults if the original mock fails
    return {
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
      deleteVocabulary: (_id: string) => Promise.resolve(undefined),
      searchVocabulary: (query: string) =>
        Promise.resolve(createMockVocabularyList(2, { word: query })),
    };
  }
};

// Export the default mock for global mocking
export default mockVocabularyAdapter;
