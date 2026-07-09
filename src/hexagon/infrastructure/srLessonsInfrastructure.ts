import type { AuthPort } from '@application/ports/authPort';
import type { SrLessonsPort } from '@application/ports/srLessonsPort';
import type { SrLesson } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getSrLessonsEndpoint } from '@learncraft-spanish/shared';

export function createSrLessonsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): SrLessonsPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getSrLessons: async () => {
      const response = await httpClient.get<SrLesson[]>(
        getSrLessonsEndpoint.path,
        getSrLessonsEndpoint.requiredScopes,
      );

      return getSrLessonsEndpoint.response.parse(response);
    },
  };
}
