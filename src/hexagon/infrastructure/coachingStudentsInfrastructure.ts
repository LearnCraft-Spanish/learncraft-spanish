import type { AuthPort } from '@application/ports/authPort';
import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
import type { CoachingStudent } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getAllCoachingStudentsEndpoint } from '@learncraft-spanish/shared';

export function createCoachingStudentsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoachingStudentsPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getAllCoachingStudents: () =>
      httpClient.get<CoachingStudent[]>(
        getAllCoachingStudentsEndpoint.path,
        getAllCoachingStudentsEndpoint.requiredScopes,
      ),
  };
}
