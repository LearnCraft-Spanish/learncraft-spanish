import type { AuthPort } from '@application/ports/authPort';
import type { SpellingPort } from '@application/ports/spellingPort';
import { createHttpClient } from '@infrastructure/http/client';
import { getKnownSpellingsByCourseAndLessonEndpoint } from '@learncraft-spanish/shared';

export function createSpellingInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): SpellingPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getSpellingsKnownForLesson: async (
      courseId: number,
      lessonNumber: number,
    ): Promise<string[]> => {
      const response = await httpClient.get<string[]>(
        getKnownSpellingsByCourseAndLessonEndpoint.path,
        getKnownSpellingsByCourseAndLessonEndpoint.requiredScopes,
        {
          params: {
            courseId: courseId.toString(),
            lessonNumber: lessonNumber.toString(),
          },
        },
      );
      return response;
    },
  };
}
