import type { UseFlashcardsQueryReturnType } from '@application/queries/useFlashcardsQuery';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockUseFlashcardsQuery: UseFlashcardsQueryReturnType = {
  flashcards: createMockFlashcardList()(3),
  isLoading: false,
  error: null,
  pendingDeleteExampleIds: [],
  isFetchingFlashcards: false,
  createFlashcards: async () => createMockFlashcardList()(1),
  deleteFlashcards: async (exampleIds) => exampleIds.length,
  updateFlashcards: async (updates) =>
    createMockFlashcardList()(updates.length),
};

export const {
  mock: mockUseFlashcardsQuery,
  override: overrideMockUseFlashcardsQuery,
  reset: resetMockUseFlashcardsQuery,
} = createOverrideableMock<UseFlashcardsQueryReturnType>(
  defaultMockUseFlashcardsQuery,
);

export default mockUseFlashcardsQuery;
