import type { Flashcard } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import {
  createFlashcardEndpoint,
  deleteFlashcardEndpoint,
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createHttpClient } from './http/client';

export function createFlashcardInfrastructure(apiUrl: string, auth: AuthPort) {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getMyFlashcards: async (): Promise<Flashcard[]> => {
      const response = await httpClient.get<Flashcard[]>(
        getMyFlashcardsEndpoint.path,
        getMyFlashcardsEndpoint.requiredScopes,
      );
      return response;
    },

    getStudentFlashcards: async (studentId: number): Promise<Flashcard[]> => {
      const response = await httpClient.get<Flashcard[]>(
        getStudentFlashcardsEndpoint.path.replace(
          ':studentId',
          studentId.toString(),
        ),
        getStudentFlashcardsEndpoint.requiredScopes,
      );
      return response;
    },

    createFlashcard: async (flashcard: Flashcard): Promise<Flashcard> => {
      const response = await httpClient.post<Flashcard>(
        createFlashcardEndpoint.path,
        createFlashcardEndpoint.requiredScopes,

        flashcard,
      );
      return response;
    },

    deleteFlashcard: async (flashcardId: number): Promise<void> => {
      await httpClient.delete(
        deleteFlashcardEndpoint.path.replace(
          ':flashcardId',
          flashcardId.toString(),
        ),
        deleteFlashcardEndpoint.requiredScopes,
      );
    },
  };
}
