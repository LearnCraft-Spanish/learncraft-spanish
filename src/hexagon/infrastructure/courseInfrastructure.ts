import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type {
  CourseDetailed,
  CourseWithLessons,
  Lesson,
} from '@learncraft-spanish/shared';

import { createHttpClient } from '@infrastructure/http/client';
import {
  getAllCoursesEndpoint,
  getAllCoursesWithLessonsEndpoint,
  getLessonRangeVocabRequiredEndpoint,
  getLessonsByVocabularyEndpoint,
  getLessonVocabKnownEndpoint,
  getPublishedCoursesWithLessonsEndpoint,
  updateCoursesEndpoint,
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

    getAllCoursesWithLessons: async (): Promise<CourseWithLessons[]> => {
      const response = await httpClient.get<CourseWithLessons[]>(
        getAllCoursesWithLessonsEndpoint.path,
        getAllCoursesWithLessonsEndpoint.requiredScopes,
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

    getAllCourses: async (): Promise<CourseDetailed[]> => {
      const response = await httpClient.get<CourseDetailed[]>(
        getAllCoursesEndpoint.path,
        getAllCoursesEndpoint.requiredScopes,
      );
      return response;
    },

    updateCourses: async (
      courses: CourseDetailed[],
    ): Promise<CourseDetailed[]> => {
      const response = await httpClient.put<CourseDetailed[]>(
        updateCoursesEndpoint.path,
        updateCoursesEndpoint.requiredScopes,
        { courses },
      );
      return response;
    },
  };
}
