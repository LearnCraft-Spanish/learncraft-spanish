import type { AuthPort } from '@application/ports/authPort';
import type { QuizPort } from '@application/ports/quizPort';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getQuizExamplesByQuizIdEndpoint } from '@learncraft-spanish/shared';

export function createQuizInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): QuizPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getQuizExamples: async ({
      quizId,
      vocabularyComplete,
    }: {
      quizId: number;
      vocabularyComplete?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (vocabularyComplete !== undefined) {
        params.append('vocabularyComplete', String(vocabularyComplete));
      }

      const pathWithParams =
        getQuizExamplesByQuizIdEndpoint.path.replace(
          ':quizId',
          quizId.toString(),
        ) + (params.toString() ? `?${params.toString()}` : '');

      const response = await httpClient.get<ExampleWithVocabulary[]>(
        pathWithParams,
        getQuizExamplesByQuizIdEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
