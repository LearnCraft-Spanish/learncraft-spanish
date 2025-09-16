import type { FlashcardPort } from '@application/ports/flashcardPort';
import type {
  ExampleWithVocabulary,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation matching the port exactly
const defaultMockAdapter: FlashcardPort = {
  getMyFlashcards: () => Promise.resolve(createMockFlashcardList(5)()),
  getStudentFlashcards: (_studentId: number) =>
    Promise.resolve(createMockFlashcardList(5)()),
  createMyStudentFlashcards: ({
    examples,
  }: {
    examples: ExampleWithVocabulary[];
  }) =>
    Promise.resolve(
      examples.map((example) => createMockFlashcard({ id: example.id })),
    ),
  createStudentFlashcards: ({
    studentId: _studentId,
    examples,
  }: {
    studentId: number;
    examples: ExampleWithVocabulary[];
  }) =>
    Promise.resolve(
      examples.map((example) => createMockFlashcard({ id: example.id })),
    ),
  deleteMyStudentFlashcards: ({ flashcardIds }: { flashcardIds: number[] }) =>
    Promise.resolve(flashcardIds.length),
  deleteStudentFlashcards: ({ flashcardIds }: { flashcardIds: number[] }) =>
    Promise.resolve(flashcardIds.length),
  updateMyStudentFlashcards: ({
    updates,
  }: {
    updates: UpdateFlashcardIntervalCommand[];
  }) =>
    Promise.resolve(
      updates.map((update) => createMockFlashcard({ id: update.flashcardId })),
    ),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockFlashcardAdapter,
  override: overrideMockFlashcardAdapter,
  reset: resetMockFlashcardAdapter,
} = createOverrideableMock<FlashcardPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockFlashcardAdapter;
