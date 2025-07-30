import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

export interface CoursePort {
  /**
   * Get the courses with lessons
   */
  getCoursesWithLessons: () => Promise<CourseWithLessons[]>;
  /**
   * Get the lessons that taught a vocabulary
   */
  getLessonsByVocabulary: (vocabId: number) => Promise<Lesson[]>;
}
