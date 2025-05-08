import type { getSpellingsKnownForLessonParams } from '@LearnCraft-Spanish/shared';
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
      data: getSpellingsKnownForLessonParams,
    ) => {
      const lessonFromNumber = data.lessonFromNumber.toString()
        ? data.lessonFromNumber.toString()
        : '';
      const formattedCourseName = data.courseName.replace(' ', '+');
      const path = frequensayEndpoints.getSpellingsKnownForLesson.path
        .replace(':courseName', formattedCourseName)
        .replace(':lessonToNumber', data.lessonToNumber.toString())
        .replace(':lessonFromNumber', lessonFromNumber);

      const response = await httpClient.get<string[]>(path);
      return response;
    },
  };
}
