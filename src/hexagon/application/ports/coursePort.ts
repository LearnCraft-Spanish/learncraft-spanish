import type { CourseWithLessons } from '@LearnCraft-Spanish/shared';

export interface CoursePort {
  getCoursesWithLessons: () => Promise<CourseWithLessons[]>;
}
