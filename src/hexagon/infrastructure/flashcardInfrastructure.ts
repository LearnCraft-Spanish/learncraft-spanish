import type { Flashcard } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import {
  createStudentExamplesEndpoint,
  deleteStudentExamplesEndpoint,
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

    createStudentFlashcards: async ({
      studentId,
      exampleIds,
    }: {
      studentId: number;
      exampleIds: number[];
    }): Promise<number> => {
      const response = await httpClient.post<number>(
        createStudentExamplesEndpoint.path,
        createStudentExamplesEndpoint.requiredScopes,
        {
          newStudentExamples: exampleIds.map((id) => ({
            studentId: studentId.toString(),
            exampleId: id.toString(),
          })),
        },
      );
      return response;
    },

    deleteStudentFlashcards: async ({
      studentExampleIds,
    }: {
      studentExampleIds: number[];
    }): Promise<number> => {
      const studentExampleIdsString = studentExampleIds.join(',');

      const response = await httpClient.delete<number>(
        deleteStudentExamplesEndpoint.path,
        deleteStudentExamplesEndpoint.requiredScopes,
        {
          params: {
            studentExampleIds: studentExampleIdsString,
          },
        },
      );
      return response;
    },
  };
}
