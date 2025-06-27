import type { Flashcard } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import type { FlashcardPort } from '../application/ports/flashcardPort';
import {
  createFlashcardEndpoint,
  deleteFlashcardEndpoint,
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createHttpClient } from './http/client';

export function createFlashcardInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): FlashcardPort {
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

    createStudentExample: async ({
      studentId,
      exampleId,
    }: {
      studentId: number;
      exampleId: number;
    }): Promise<number> => {
      const response = await httpClient.post<number>(
        createFlashcardEndpoint.path,
        createFlashcardEndpoint.requiredScopes,
        {
          params: {
            studentId,
            exampleId,
          },
        },
      );
      return response;
    },

    deleteStudentExample: async (flashcardId: number): Promise<number> => {
      const response = await httpClient.delete<number>(
        deleteFlashcardEndpoint.path.replace(
          ':flashcardId',
          flashcardId.toString(),
        ),
        deleteFlashcardEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
