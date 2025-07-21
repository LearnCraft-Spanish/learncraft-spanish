import type { Flashcard } from '@LearnCraft-Spanish/shared';

export interface FlashcardPort {
  getMyFlashcards: () => Promise<Flashcard[]>;
  getStudentFlashcards: (studentId: number) => Promise<Flashcard[]>;
  createStudentFlashcards: ({
    studentId,
    exampleIds,
  }: {
    studentId: number;
    exampleIds: number[];
  }) => Promise<Flashcard[]>;
  deleteStudentFlashcards: ({
    studentExampleIds,
  }: {
    studentExampleIds: number[];
  }) => Promise<number>;
}
