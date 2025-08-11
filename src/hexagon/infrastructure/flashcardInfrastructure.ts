import type { Flashcard } from '@learncraft-spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import {
  createMyStudentExamplesEndpoint,
  createStudentExamplesEndpoint,
  deleteMyStudentExamplesEndpoint,
  deleteStudentExamplesEndpoint,
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
} from '@learncraft-spanish/shared';
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

    createMyStudentFlashcards: async ({
      exampleIds,
    }: {
      exampleIds: number[];
    }): Promise<Flashcard[]> => {
      const response = await httpClient.post<Flashcard[]>(
        createMyStudentExamplesEndpoint.path,
        createMyStudentExamplesEndpoint.requiredScopes,
        {
          newStudentExamples: exampleIds.map((id) => ({
            exampleId: id.toString(),
          })),
        },
      );
      return response;
    },

    deleteMyStudentFlashcards: async ({
      studentExampleIds,
      finallyFunction,
    }: {
      studentExampleIds: number[];
      finallyFunction?: () => void;
    }): Promise<number> => {
      const response = await httpClient
        .delete<number>(
          deleteMyStudentExamplesEndpoint.path,
          deleteMyStudentExamplesEndpoint.requiredScopes,
          {
            params: {
              studentExampleIds: studentExampleIds.join(','),
            },
          },
        )
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error('error', error);
          return Promise.reject(error);
        })
        .finally(() => {
          if (finallyFunction) {
            finallyFunction();
          }
        });
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
    }): Promise<Flashcard[]> => {
      const response = await httpClient.post<Flashcard[]>(
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
