import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

export interface CoursePort {
  /**
   * Get the courses with lessons
   */
  getCoursesWithLessons: () => Promise<CourseWithLessons[]>;

  getLessonVocabKnown: ({
    courseId,
    lessonNumber,
  }: {
    courseId: number;
    lessonNumber: number;
  }) => Promise<number[]>;

  getLessonRangeVocabRequired: ({
    courseId,
    fromLessonNumber,
    toLessonNumber,
  }: {
    courseId: number;
    fromLessonNumber: number;
    toLessonNumber: number;
  }) => Promise<number[]>;

  /**
   * Get the lessons that taught a vocabulary
   */
  getLessonsByVocabulary: (vocabId: number) => Promise<Lesson[]>;
}
