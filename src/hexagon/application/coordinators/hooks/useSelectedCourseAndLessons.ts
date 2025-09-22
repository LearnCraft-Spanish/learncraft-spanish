import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import type { UseSelectedCourseAndLessonsReturnType } from './types';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { use, useMemo } from 'react';
import SelectedCourseAndLessonsContext from '../contexts/SelectedCourseAndLessonsContext';
import { useActiveStudent } from './useActiveStudent';

export function useSelectedCourseAndLessons(): UseSelectedCourseAndLessonsReturnType {
  const context = use(SelectedCourseAndLessonsContext);
  if (!context) {
    throw new Error(
      'useSelectedCourseAndLessons must be used within a SelectedCourseAndLessonsProvider',
    );
  }
  const {
    userSelectedCourseId,
    updateUserSelectedCourseId,
    fromLessonNumber,
    updateFromLessonNumber,
    toLessonNumber,
    updateToLessonNumber,
  } = context;

  const {
    data: coursesWithLessons,
    isLoading,
    error,
  } = useCoursesWithLessons();
  const { appUser } = useActiveStudent();

  const course: CourseWithLessons | null = useMemo(() => {
    let newCourseId: number | null;

    if (userSelectedCourseId) {
      newCourseId = userSelectedCourseId;
    } else {
      if (appUser && appUser.studentRole === 'student')
        newCourseId = appUser.courseId;
      else newCourseId = 2;
    }
    return coursesWithLessons?.find((item) => item.id === newCourseId) || null;
  }, [coursesWithLessons, userSelectedCourseId, appUser]);

  const fromLesson: Lesson | null = useMemo(() => {
    if (!fromLessonNumber || !course) {
      return null;
    }

    return (
      course.lessons.find((item) => item.lessonNumber === fromLessonNumber) ||
      course.lessons[0]
    );
  }, [course, fromLessonNumber]);

  const toLesson: Lesson | null = useMemo(() => {
    if (!toLessonNumber && !course) {
      return null;
    }
    const newToLessonNumber =
      toLessonNumber ||
      appUser?.lessonNumber ||
      course?.lessons[0].lessonNumber;

    return (
      course?.lessons.find((item) => item.lessonNumber === newToLessonNumber) ||
      null
    );
  }, [course, toLessonNumber, appUser]);

  // ------------------ Return ------------------ //
  return {
    course,
    courseId: course?.id ?? null,
    fromLesson,
    fromLessonNumber: fromLesson?.lessonNumber ?? null,
    toLesson,
    toLessonNumber: toLesson?.lessonNumber ?? null,
    updateUserSelectedCourseId,
    updateFromLessonNumber,
    updateToLessonNumber,
    isLoading,
    error,
  };
}
