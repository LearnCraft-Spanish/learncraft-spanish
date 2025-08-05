import type {
  CourseWithLessons,
  Lesson,
  LessonWithVocab,
} from '@learncraft-spanish/shared';

export interface CoursePort {
  /**
   * Get the courses with lessons
   */
  getCoursesWithLessons: () => Promise<CourseWithLessons[]>;

  /**
   * Get the lesson with vocabulary
   */
  getLessonWithVocabulary: ({
    courseId,
    lessonNumber,
  }: {
    courseId: number;
    lessonNumber: number;
  }) => Promise<LessonWithVocab>;

  /**
   * Get the lessons that taught a vocabulary
   */
  getLessonsByVocabulary: (vocabId: number) => Promise<Lesson[]>;
}
