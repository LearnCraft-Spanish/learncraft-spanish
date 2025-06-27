import type { Flashcard } from '@LearnCraft-Spanish/shared';

export interface FlashcardPort {
  getMyFlashcards: () => Promise<Flashcard[]>;
  getStudentFlashcards: (studentId: number) => Promise<Flashcard[]>;
  createStudentExample: ({
    studentId,
    exampleId,
  }: {
    studentId: number;
    exampleId: number;
  }) => Promise<number>;
  deleteStudentExample: (studentId: number) => Promise<number>;
}
