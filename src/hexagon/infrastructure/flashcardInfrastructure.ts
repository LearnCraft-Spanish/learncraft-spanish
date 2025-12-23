import type { AuthPort } from '@application/ports/authPort';
import type { FlashcardPort } from '@application/ports/flashcardPort';
import type {
  ExampleWithVocabulary,
  Flashcard,
  UpdateFlashcardIntervalCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createFlashcardsEndpoint,
  createMyFlashcardsEndpoint,
  deleteFlashcardsEndpoint,
  deleteMyFlashcardsEndpoint,
  getMyFlashcardsEndpoint,
  getStudentFlashcardsEndpoint,
  updateMyFlashcardsEndpoint,
} from '@learncraft-spanish/shared';

export function createFlashcardInfrastructure(
  apiUrl: string,
  authPort: AuthPort,
): FlashcardPort {
  const httpClient = createHttpClient(apiUrl, authPort);
  const getMyFlashcards = async (): Promise<Flashcard[]> => {
    const response = await httpClient.get<Flashcard[]>(
      getMyFlashcardsEndpoint.path,
      getMyFlashcardsEndpoint.requiredScopes,
    );
    return response;
  };

  const createMyStudentFlashcards = async ({
    examples,
  }: {
    examples: ExampleWithVocabulary[];
  }): Promise<Flashcard[]> => {
    const response = await httpClient.post<Flashcard[]>(
      createMyFlashcardsEndpoint.path,
      createMyFlashcardsEndpoint.requiredScopes,
      {
        newFlashcards: examples.map((example) => ({
          exampleId: example.id.toString(),
        })),
      },
    );
    return response;
  };

  const updateMyStudentFlashcards = async ({
    updates,
  }: {
    updates: UpdateFlashcardIntervalCommand[];
  }): Promise<Flashcard[]> => {
    const response = await httpClient.put<Flashcard[]>(
      updateMyFlashcardsEndpoint.path,
      updateMyFlashcardsEndpoint.requiredScopes,
      {
        updates,
      },
    );
    return response;
  };

  const deleteMyStudentFlashcards = async ({
    flashcardIds,
    finallyFunction,
  }: {
    flashcardIds: number[];
    finallyFunction?: () => void;
  }): Promise<number> => {
    const response = await httpClient
      .delete<number>(
        deleteMyFlashcardsEndpoint.path,
        deleteMyFlashcardsEndpoint.requiredScopes,
        {
          params: {
            flashcardIds: flashcardIds.join(','),
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
  };

  const getStudentFlashcards = async (
    studentId: number,
  ): Promise<Flashcard[]> => {
    const response = await httpClient.get<Flashcard[]>(
      getStudentFlashcardsEndpoint.path.replace(
        ':studentId',
        studentId.toString(),
      ),
      getStudentFlashcardsEndpoint.requiredScopes,
    );
    return response;
  };

  const createStudentFlashcards = async ({
    studentId,
    examples,
  }: {
    studentId: number;
    examples: ExampleWithVocabulary[];
  }): Promise<Flashcard[]> => {
    const response = await httpClient.post<Flashcard[]>(
      createFlashcardsEndpoint.path,
      createFlashcardsEndpoint.requiredScopes,
      {
        newFlashcards: examples.map((example) => ({
          studentId: studentId.toString(),
          exampleId: example.id.toString(),
        })),
      },
    );
    return response;
  };

  const deleteStudentFlashcards = async ({
    flashcardIds,
  }: {
    flashcardIds: number[];
  }): Promise<number> => {
    const flashcardIdsString = flashcardIds.join(',');

    const response = await httpClient.delete<number>(
      deleteFlashcardsEndpoint.path,
      deleteFlashcardsEndpoint.requiredScopes,
      {
        params: {
          flashcardIds: flashcardIdsString,
        },
      },
    );
    return response;
  };
  return {
    getMyFlashcards,
    createMyStudentFlashcards,
    updateMyStudentFlashcards,
    deleteMyStudentFlashcards,
    getStudentFlashcards,
    createStudentFlashcards,
    deleteStudentFlashcards,
  };
}
