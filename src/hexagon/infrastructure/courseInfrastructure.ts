import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

import { createHttpClient } from '@infrastructure/http/client';
import {
  getCoursesWithLessonsEndpoint,
  getLessonRangeVocabRequiredEndpoint,
  getLessonsByVocabularyEndpoint,
  getLessonVocabKnownEndpoint,
} from '@learncraft-spanish/shared';

export function createCourseInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoursePort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getCoursesWithLessons: async (): Promise<CourseWithLessons[]> => {
      const response = await httpClient.get<CourseWithLessons[]>(
        getCoursesWithLessonsEndpoint.path,
        getCoursesWithLessonsEndpoint.requiredScopes,
      );
      return response;
    },

    getLessonVocabKnown: async ({ courseId, lessonNumber }) => {
      const response = await httpClient.get<number[]>(
        getLessonVocabKnownEndpoint.path,
        getLessonVocabKnownEndpoint.requiredScopes,
        {
          params: {
            courseId,
            lessonNumber,
          },
        },
      );
      return response;
    },

    getLessonRangeVocabRequired: async ({
      courseId,
      fromLessonNumber,
      toLessonNumber,
    }) => {
      const response = await httpClient.get<number[]>(
        getLessonRangeVocabRequiredEndpoint.path,
        getLessonRangeVocabRequiredEndpoint.requiredScopes,
        {
          params: {
            courseId,
            toLessonNumber,
            fromLessonNumber,
          },
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
