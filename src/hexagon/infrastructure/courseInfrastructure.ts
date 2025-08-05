import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type {
  CourseWithLessons,
  Lesson,
  LessonWithVocab,
} from '@learncraft-spanish/shared';

import { createHttpClient } from '@infrastructure/http/client';
import {
  getCoursesWithLessonsEndpoint,
  getLessonsByVocabularyEndpoint,
  getLessonWithVocabularyEndpoint,
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

    getLessonWithVocabulary: async ({
      courseId,
      lessonNumber,
    }: {
      courseId: number;
      lessonNumber: number;
    }): Promise<LessonWithVocab> => {
      const response = await httpClient.get<LessonWithVocab>(
        getLessonWithVocabularyEndpoint.path,
        getLessonWithVocabularyEndpoint.requiredScopes,
        {
          params: {
            courseId,
            lessonNumber,
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
