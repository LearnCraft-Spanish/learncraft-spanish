import type { AuthPort } from '@application/ports/authPort';
import type { ProgramPort } from '@application/ports/programPort';
import type { ProgramWithLessons } from '@LearnCraft-Spanish/shared';
import { getProgramsWithLessonsEndpoint } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from './http/client';

export function createProgramInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): ProgramPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getPrograms: async (): Promise<ProgramWithLessons[]> => {
      const response = await httpClient.get<ProgramWithLessons[]>(
        getProgramsWithLessonsEndpoint.path,
      );
      return response;
    },
  };
}
