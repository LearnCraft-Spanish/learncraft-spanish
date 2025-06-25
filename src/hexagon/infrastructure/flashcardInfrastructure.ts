import type { Flashcard } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import {
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createHttpClient } from './http/client';

export function createFlashcardInfrastructure(
  apiUrl: string,
  authPort: AuthPort,
) {
  const httpClient = createHttpClient(apiUrl, authPort);

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
  };
}
