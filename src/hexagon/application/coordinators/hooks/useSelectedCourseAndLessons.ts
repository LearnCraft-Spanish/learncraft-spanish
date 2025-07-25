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
    fromLessonId,
    updateFromLessonId,
    toLessonId,
    updateToLessonId,
  } = context;

  const { data: coursesWithLessons, isLoading } = useCoursesWithLessons();
  const { appUser } = useActiveStudent();

  const course = useMemo(() => {
    let newCourseId: number;

    if (userSelectedCourseId) {
      newCourseId = userSelectedCourseId;
    } else {
      newCourseId = appUser?.courseId || 0;
    }
    return coursesWithLessons?.find((item) => item.id === newCourseId) || null;
  }, [coursesWithLessons, userSelectedCourseId, appUser?.courseId]);

  const fromLesson = useMemo(() => {
    if (!fromLessonId || !course) {
      return null;
    }

    return course.lessons.find((item) => item.id === fromLessonId) || null;
  }, [course, fromLessonId]);

  const toLesson = useMemo(() => {
    if (!toLessonId && !course) {
      return null;
    }
    const newToLessonId = toLessonId || appUser?.lessonNumber || 0;

    return course?.lessons.find((item) => item.id === newToLessonId) || null; // TODO: check if this is correct
  }, [course, toLessonId, appUser]);

  // ------------------ Return ------------------ //
  return {
    course,
    fromLesson,
    toLesson,
    updateUserSelectedCourseId,
    updateFromLessonId,
    updateToLessonId,

    isLoading,
  };
}
