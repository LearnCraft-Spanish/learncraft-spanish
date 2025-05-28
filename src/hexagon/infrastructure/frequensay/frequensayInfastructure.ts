import type { getSpellingsKnownForLessonQuery } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../../application/ports/authPort';
import type { FrequensayPort } from '../../application/ports/frequensayPort';
import { frequensayEndpoints } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

export function createFrequensayInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): FrequensayPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getSpellingsKnownForLesson: async (
      data: getSpellingsKnownForLessonQuery,
    ) => {
      const lessonNumber = data.lessonNumber.toString();
      const formattedCourseName = data.courseName.replace(' ', '+');
      const response = await httpClient.get<string[]>(
        frequensayEndpoints.getSpellingsKnownForLesson.path,
        {
          params: {
            courseName: formattedCourseName,
            lessonNumber,
          },
        },
      );
      return response;
    },
  };
}
