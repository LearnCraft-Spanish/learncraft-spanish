import type {
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';

export interface FlashcardPort {
  getMyFlashcards: () => Promise<Flashcard[]>;
  getStudentFlashcards: (studentId: number) => Promise<Flashcard[]>;
  createMyStudentFlashcards: ({
    exampleIds,
  }: {
    exampleIds: number[];
  }) => Promise<Flashcard[]>;
  createStudentFlashcards: ({
    studentId,
    exampleIds,
  }: {
    studentId: number;
    exampleIds: number[];
  }) => Promise<Flashcard[]>;
  deleteMyStudentFlashcards: ({
    studentExampleIds,
  }: {
    studentExampleIds: number[];
  }) => Promise<number>;
  deleteStudentFlashcards: ({
    studentExampleIds,
  }: {
    studentExampleIds: number[];
  }) => Promise<number>;
  updateMyStudentFlashcards: ({
    updates,
  }: {
    updates: UpdateFlashcardIntervalCommand[];
  }) => Promise<Flashcard[]>;
}
