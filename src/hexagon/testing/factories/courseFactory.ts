import type { CourseWithLessons } from '@learncraft-spanish/shared';
import {
  CourseWithLessonsSchema,
  LessonWithVocabSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockCourseWithLessons = createZodFactory(
  CourseWithLessonsSchema,
);
export const createMockCourseWithLessonsList = createZodListFactory(
  CourseWithLessonsSchema,
);

export const createMockLessonWithVocab = createZodFactory(
  LessonWithVocabSchema,
);

// Create realistic mock data based on the old programsTable structure
export function createRealisticCourseWithLessonsList(): CourseWithLessons[] {
  const baseCoursesWithLessons: CourseWithLessons[] = [
    {
      id: 2,
      name: 'LearnCraft Spanish',
      published: true,
      lessons: [
        {
          id: 334,
          lessonNumber: 1,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 71,
          lessonNumber: 2,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 72,
          lessonNumber: 3,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 73,
          lessonNumber: 4,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 74,
          lessonNumber: 5,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 75,
          lessonNumber: 6,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 76,
          lessonNumber: 7,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 77,
          lessonNumber: 8,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 78,
          lessonNumber: 9,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 79,
          lessonNumber: 10,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 80,
          lessonNumber: 11,
          courseName: 'LearnCraft Spanish',
        },
        {
          id: 131,
          lessonNumber: 62,
          courseName: 'LearnCraft Spanish',
        },
      ],
    },
    {
      id: 3,
      name: 'Spanish in One Month',
      published: true,
      lessons: [
        {
          id: 1,
          lessonNumber: 1,
          courseName: 'Spanish in One Month',
        },
        {
          id: 2,
          lessonNumber: 2,
          courseName: 'Spanish in One Month',
        },
        {
          id: 3,
          lessonNumber: 3,
          courseName: 'Spanish in One Month',
        },
        {
          id: 4,
          lessonNumber: 4,
          courseName: 'Spanish in One Month',
        },
        {
          id: 5,
          lessonNumber: 5,
          courseName: 'Spanish in One Month',
        },
        {
          id: 6,
          lessonNumber: 6,
          courseName: 'Spanish in One Month',
        },
        {
          id: 7,
          lessonNumber: 7,
          courseName: 'Spanish in One Month',
        },
        {
          id: 8,
          lessonNumber: 8,
          courseName: 'Spanish in One Month',
        },

        {
          id: 9,
          lessonNumber: 9,
          courseName: 'Spanish in One Month',
        },
        {
          id: 10,
          lessonNumber: 10,
          courseName: 'Spanish in One Month',
        },
        {
          id: 11,
          lessonNumber: 11,
          courseName: 'Spanish in One Month',
        },
        {
          id: 12,
          lessonNumber: 12,
          courseName: 'Spanish in One Month',
        },
        {
          id: 13,
          lessonNumber: 13,
          courseName: 'Spanish in One Month',
        },
        {
          id: 14,
          lessonNumber: 14,
          courseName: 'Spanish in One Month',
        },
        {
          id: 15,
          lessonNumber: 15,
          courseName: 'Spanish in One Month',
        },
        {
          id: 16,
          lessonNumber: 16,
          courseName: 'Spanish in One Month',
        },
        {
          id: 17,
          lessonNumber: 17,
          courseName: 'Spanish in One Month',
        },
        {
          id: 18,
          lessonNumber: 18,
          courseName: 'Spanish in One Month',
        },
        {
          id: 19,
          lessonNumber: 19,
          courseName: 'Spanish in One Month',
        },
        {
          id: 20,
          lessonNumber: 20,
          courseName: 'Spanish in One Month',
        },
      ],
    },
    {
      id: 4,
      name: 'Ser Estar Mini Course',
      published: true,
      lessons: [
        {
          id: 345,
          lessonNumber: 1,
          courseName: 'Ser Estar Mini Course',
        },
        {
          id: 346,
          lessonNumber: 2,
          courseName: 'Ser Estar Mini Course',
        },
        {
          id: 347,
          lessonNumber: 3,
          courseName: 'Ser Estar Mini Course',
        },
        {
          id: 348,
          lessonNumber: 4,
          courseName: 'Ser Estar Mini Course',
        },
        {
          id: 349,
          lessonNumber: 5,
          courseName: 'Ser Estar Mini Course',
        },
      ],
    },
    {
      id: 5,
      name: 'Post-Challenge Lessons',
      published: true,
      lessons: [
        {
          id: 350,
          lessonNumber: 1,
          courseName: 'Post-Challenge Lessons',
        },
        {
          id: 351,
          lessonNumber: 2,
          courseName: 'Post-Challenge Lessons',
        },
        {
          id: 352,
          lessonNumber: 3,
          courseName: 'Post-Challenge Lessons',
        },
        {
          id: 353,
          lessonNumber: 4,
          courseName: 'Post-Challenge Lessons',
        },
        {
          id: 354,
          lessonNumber: 5,
          courseName: 'Post-Challenge Lessons',
        },
        {
          id: 355,
          lessonNumber: 6,
          courseName: 'Post-Challenge Lessons',
        },
      ],
    },
  ];

  return baseCoursesWithLessons;
}
