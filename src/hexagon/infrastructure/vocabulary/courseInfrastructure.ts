import type { AuthPort } from '@application/ports/authPort';
import type { CoursePort } from '@application/ports/coursePort';
import type {
  Course,
  CourseWithLessons,
  Lesson,
  LessonWithVocab,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '@infrastructure/http/client';
import { coursesEndpoints } from '@LearnCraft-Spanish/shared';

export function createCourseInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoursePort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getCourses: async (): Promise<Course[]> => {
      const response = await httpClient.get<Course[]>(
        coursesEndpoints.getCoursesWithLessonsEndpoint.path,
      );
      return response;
    },

    getCourseById: async (id: number): Promise<CourseWithLessons | null> => {
      const response = await httpClient.get<CourseWithLessons | null>(
        coursesEndpoints.getCourseByIdEndpoint.path.replace(
          ':id',
          id.toString(),
        ),
        {
          params: { id: id.toString() },
        },
      );
      return response;
    },

    getLessons: async (): Promise<Lesson[]> => {
      const response = await httpClient.get<Lesson[]>(
        coursesEndpoints.getLessonsEndpoint.path,
      );
      return response;
    },

    getLessonById: async (id: number): Promise<LessonWithVocab | null> => {
      const response = await httpClient.get<LessonWithVocab | null>(
        coursesEndpoints.getLessonByIdEndpoint.path.replace(
          ':id',
          id.toString(),
        ),
      );
      return response;
    },

    getLessonsByVocabulary: async (vocabId: number): Promise<Lesson[]> => {
      const response = await httpClient.get<Lesson[]>(
        coursesEndpoints.getLessonsByVocabularyEndpoint.path.replace(
          ':vocabularyId',
          vocabId.toString(),
        ),
      );
      return response;
    },

    getSpellingsKnownForLesson: async (
      courseId: number,
      lessonNumber: number,
    ): Promise<string[]> => {
      const response = await httpClient.get<string[]>(
        coursesEndpoints.getKnownSpellingsByCourseAndLessonEndpoint.path,
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
