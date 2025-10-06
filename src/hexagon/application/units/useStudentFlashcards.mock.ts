import type { UseStudentFlashcardsReturn } from './useStudentFlashcards';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockUseStudentFlashcards: UseStudentFlashcardsReturn = {
  // Default to realistic mock data using factories
  flashcards: createMockFlashcardList()(3),
  flashcardsDueForReview: createMockFlashcardList()(2),
  customFlashcards: createMockFlashcardList()(1),
  customFlashcardsDueForReview: createMockFlashcardList()(1),
  audioFlashcards: createMockFlashcardList()(2),
  collectedExamples: createMockExampleWithVocabularyList()(3),
  isLoading: false,
  error: null,

  // Main function we care about for SRS functionality
  updateFlashcardInterval: async () => Promise.resolve(1),

  // Helper functions with sensible defaults
  getRandomFlashcards: ({ count }) => {
    const mockFlashcards = createMockFlashcardList()(5);
    return mockFlashcards.slice(0, count);
  },
  isFlashcardCollected: () => false,
  isExampleCollected: () => false,
  isAddingFlashcard: () => false,
  isRemovingFlashcard: () => false,
  isCustomFlashcard: () => false,
  isPendingFlashcard: () => false,

  // CRUD operations with realistic responses
  createFlashcards: async (exampleIds) => {
    return Promise.resolve(createMockFlashcardList()(exampleIds.length));
  },
  deleteFlashcards: async (exampleIds) => {
    return Promise.resolve(exampleIds.length);
  },
  updateFlashcards: async (updates) => {
    return Promise.resolve(createMockFlashcardList()(updates.length));
  },
};

export const {
  mock: mockUseStudentFlashcards,
  override: overrideMockUseStudentFlashcards,
  reset: resetMockUseStudentFlashcards,
} = createOverrideableMock<UseStudentFlashcardsReturn>(
  defaultMockUseStudentFlashcards,
);
