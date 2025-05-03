import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  GetTotalCountResponse,
  Vocabulary,
} from '@LearnCraft-Spanish/shared';
import type { VocabularyPort } from '../ports/vocabularyPort';
import {
  createMockVocabulary,
  createMockVocabularyList,
} from 'src/hexagon/testing/factories/vocabularyFactories';
import { setMockResult } from 'src/hexagon/testing/utils/setMockResult';
import { createTypedMock } from 'src/hexagon/testing/utils/typedMock';

// Create strongly-typed spies for each VocabularyPort method
export const mockGetVocabulary = createTypedMock<
  () => Promise<Vocabulary[]>
>().mockResolvedValue(createMockVocabularyList());

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

// Global mock for the adapter
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

export const callMockVocabularyAdapter = () => mockVocabularyAdapter;

// Export the default mock for global mocking
export default mockVocabularyAdapter;
