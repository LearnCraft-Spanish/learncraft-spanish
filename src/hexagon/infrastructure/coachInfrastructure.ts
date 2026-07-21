import type { AuthPort } from '@application/ports/authPort';
import type { CoachPort } from '@application/ports/coachPort';
import type { Coach, CoachCallCount } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getAllCoachesEndpoint,
  getAllCoachesForStudentEndpoint,
  getRecentRecordsEndpoint,
} from '@learncraft-spanish/shared';

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
    getAllCoaches: () =>
      httpClient.get<Coach[]>(
        getAllCoachesEndpoint.path,
        getAllCoachesEndpoint.requiredScopes,
      ),
    getRecentRecords: async (coachId: string, monthYear: string) => {
      const response = await httpClient.get<unknown>(
        getRecentRecordsEndpoint.path,
        getRecentRecordsEndpoint.requiredScopes,
        {
          params: {
            coachId,
            monthYear,
          },
        },
      );

      return getRecentRecordsEndpoint.response.parse(response);
    },
  };
}
