import type { Flashcard } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import {
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from './http/client';

export function createFlashcardInfrastructure(apiUrl: string, auth: AuthPort) {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getMyFlashcards: async (): Promise<Flashcard[]> => {
      const response = await httpClient.get<Flashcard[]>(
        getMyFlashcardsEndpoint.path,
      );
      return response;
    },

    getStudentFlashcards: async (studentId: number): Promise<Flashcard[]> => {
      const response = await httpClient.get<Flashcard[]>(
        getStudentFlashcardsEndpoint.path.replace(
          ':studentId',
          studentId.toString(),
        ),
      );
      return response;
    },
  };
}
