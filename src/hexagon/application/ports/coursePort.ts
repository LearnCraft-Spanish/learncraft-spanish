import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

export interface LessonRange {
  courseId: number;
  fromLessonNumber: number;
  toLessonNumber: number;
}

export interface CoursePort {
  /**
   * Get the courses with lessons
   */
  getCoursesWithLessons: () => Promise<CourseWithLessons[]>;

  getLessonVocabKnown: ({
    lessonRanges,
  }: {
    lessonRanges: LessonRange[];
  }) => Promise<number[]>;

  getLessonRangeVocabRequired: ({
    lessonRanges,
  }: {
    lessonRanges: LessonRange[];
  }) => Promise<number[]>;

  /**
   * Get the lessons that taught a vocabulary
   */
  getLessonsByVocabulary: (vocabId: number) => Promise<Lesson[]>;
}
