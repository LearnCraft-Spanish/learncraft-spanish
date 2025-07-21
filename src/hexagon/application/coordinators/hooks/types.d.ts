import type {
  AppUser,
  CourseWithLessons,
  Lesson,
} from '@LearnCraft-Spanish/shared';

export interface UseActiveStudentReturnType {
  appUser: AppUser | null;
  isLoading: boolean;
  error: Error | null;
  isOwnUser: boolean;
  changeActiveStudent: (newEmail: string | null) => void;
}

export interface UseSelectedCourseAndLessonsReturnType {
  course: CourseWithLessons | null;
  fromLesson: Lesson | null;
  toLesson: Lesson | null;
  updateUserSelectedCourseId: (courseId: number) => void;
  updateFromLessonId: (lessonId: number) => void;
  updateToLessonId: (lessonId: number) => void;

  isLoading: boolean;
}
