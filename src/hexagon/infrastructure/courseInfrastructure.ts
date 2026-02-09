import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

import { createHttpClient } from '@infrastructure/http/client';
import {
  getLessonRangeVocabRequiredEndpoint,
  getLessonsByVocabularyEndpoint,
  getLessonVocabKnownEndpoint,
  getPublishedCoursesWithLessonsEndpoint,
} from '@learncraft-spanish/shared';

export function createCourseInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoursePort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getPublishedCoursesWithLessons: async (): Promise<CourseWithLessons[]> => {
      const response = await httpClient.get<CourseWithLessons[]>(
        getPublishedCoursesWithLessonsEndpoint.path,
        getPublishedCoursesWithLessonsEndpoint.requiredScopes,
      );
      return response;
    },

    getLessonVocabKnown: async ({ lessonRanges }) => {
      const response = await httpClient.post<number[]>(
        getLessonVocabKnownEndpoint.path,
        getLessonVocabKnownEndpoint.requiredScopes,
        {
          lessonRanges,
        },
      );
      return response;
    },

    getLessonRangeVocabRequired: async ({ lessonRanges }) => {
      const response = await httpClient.post<number[]>(
        getLessonRangeVocabRequiredEndpoint.path,
        getLessonRangeVocabRequiredEndpoint.requiredScopes,
        {
          lessonRanges,
        },
      );
      return response;
    },

    getLessonsByVocabulary: async (vocabId: number): Promise<Lesson[]> => {
      const response = await httpClient.get<Lesson[]>(
        getLessonsByVocabularyEndpoint.path.replace(
          ':vocabularyId',
          vocabId.toString(),
        ),
        getLessonsByVocabularyEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
