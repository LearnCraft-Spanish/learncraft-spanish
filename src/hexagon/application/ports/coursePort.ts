import type {
  Course,
  CourseWithLessons,
  Lesson,
  LessonWithVocab,
} from '@LearnCraft-Spanish/shared';

export interface CoursePort {
  /**
   * Get the courses
   */
  getCourses: () => Promise<Course[]>;

  /**
   * Get the course by id
   */
  getCourseById: (id: number) => Promise<CourseWithLessons | null>;

  /**
   * Get the lessons
   */
  getLessons: () => Promise<Lesson[]>;

  /**
   * Get the lesson by id
   */
  getLessonById: (id: number) => Promise<LessonWithVocab | null>;

  /**
   * Get the spellings known for a lesson
   */
  getSpellingsKnownForLesson: (
    courseId: number,
    lessonNumber: number,
  ) => Promise<string[]>;
}
