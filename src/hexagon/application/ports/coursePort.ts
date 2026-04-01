import type {
  CourseDetailed,
  CourseWithLessons,
  Lesson,
} from '@learncraft-spanish/shared';

export interface LessonRange {
  courseId: number;
  fromLessonNumber: number;
  toLessonNumber: number;
}

export interface CoursePort {
  /**
   * Get the published courses with lessons
   */
  getPublishedCoursesWithLessons: () => Promise<CourseWithLessons[]>;

  /**
   * Get all courses with lessons (published and unpublished). For admin use.
   */
  getAllCoursesWithLessons: () => Promise<CourseWithLessons[]>;

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

  /**
   * Get all courses (with cohort data) for admin editing. Uses vocabQuizDb programs.
   */
  getAllCourses: () => Promise<CourseDetailed[]>;

  /**
   * Update one or more courses. Pass a single-element array for individual edits.
   */
  updateCourses: (courses: CourseDetailed[]) => Promise<CourseDetailed[]>;
}
