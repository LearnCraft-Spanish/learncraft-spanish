import type { AuthPort } from '@application/ports/authPort';
import type { QuizGroupPort } from '@application/ports/quizGroupPort';
import type { QuizGroup } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getAllQuizGroupsEndpoint } from '@learncraft-spanish/shared';

export function createQuizGroupInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): QuizGroupPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getAllQuizGroups: async () => {
      const response = await httpClient.get<QuizGroup[]>(
        getAllQuizGroupsEndpoint.path,
        getAllQuizGroupsEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
