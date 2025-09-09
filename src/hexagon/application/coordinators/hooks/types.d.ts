import type {
  AppUser,
  CourseWithLessons,
  Lesson,
} from '@learncraft-spanish/shared';

export interface UseActiveStudentReturnType {
  appUser: AppUser | null;
  isLoading: boolean;
  error: Error | null;
  isOwnUser: boolean;
  changeActiveStudent: (newEmail: string | null) => void;
}

export interface UseSelectedCourseAndLessonsReturnType {
  course: CourseWithLessons | null;
  courseId: number | null;
  fromLesson: Lesson | null;
  fromLessonNumber: number | null;
  toLesson: Lesson | null;
  toLessonNumber: number | null;
  updateUserSelectedCourseId: (courseId: number) => void;
  updateFromLessonNumber: (lessonNumber: number) => void;
  updateToLessonNumber: (lessonNumber: number) => void;

  isLoading: boolean;
  error: Error | null;
}
