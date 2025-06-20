import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type { CourseWithLessons, Lesson } from '@LearnCraft-Spanish/shared';

import { createAuthenticatedHttpClient } from '@infrastructure/http/client';
import {
  getCoursesWithLessonsEndpoint,
  getLessonsByVocabularyEndpoint,
} from '@LearnCraft-Spanish/shared';

export function createCourseInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoursePort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getCoursesWithLessons: async (): Promise<CourseWithLessons[]> => {
      const response = await httpClient.get<CourseWithLessons[]>(
        getCoursesWithLessonsEndpoint.path,
      );
      return response;
    },

    getLessonsByVocabulary: async (vocabId: number): Promise<Lesson[]> => {
      const response = await httpClient.get<Lesson[]>(
        getLessonsByVocabularyEndpoint.path.replace(
          ':vocabularyId',
          vocabId.toString(),
        ),
      );
      return response;
    },
  };
}
