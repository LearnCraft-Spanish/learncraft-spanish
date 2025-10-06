import type {
  ExampleWithVocabulary,
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';

export interface FlashcardPort {
  getMyFlashcards: () => Promise<Flashcard[]>;
  getStudentFlashcards: (studentId: number) => Promise<Flashcard[]>;
  createMyStudentFlashcards: ({
    examples,
  }: {
    examples: ExampleWithVocabulary[];
  }) => Promise<Flashcard[]>;
  createStudentFlashcards: ({
    studentId,
    examples,
  }: {
    studentId: number;
    examples: ExampleWithVocabulary[];
  }) => Promise<Flashcard[]>;
  deleteMyStudentFlashcards: ({
    flashcardIds,
  }: {
    flashcardIds: number[];
  }) => Promise<number>;
  deleteStudentFlashcards: ({
    flashcardIds,
  }: {
    flashcardIds: number[];
  }) => Promise<number>;
  updateMyStudentFlashcards: ({
    updates,
  }: {
    updates: UpdateFlashcardIntervalCommand[];
  }) => Promise<Flashcard[]>;
}
