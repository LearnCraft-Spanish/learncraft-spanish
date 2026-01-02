import type { AuthPort } from '@application/ports/authPort';
import type { CoachPort } from '@application/ports/coachPort';
import type { CoachCallCount } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getAllCoachesForStudentEndpoint } from '@learncraft-spanish/shared';

export function createCoachInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoachPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getAllCoachesByStudent: async (studentId: number) => {
      const response = await httpClient.get<CoachCallCount[]>(
        getAllCoachesForStudentEndpoint.path.replace(
          ':studentId',
          studentId.toString(),
        ),
        getAllCoachesForStudentEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
