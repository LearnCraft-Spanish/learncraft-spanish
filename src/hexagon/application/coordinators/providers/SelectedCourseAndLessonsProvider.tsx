import type { Lesson } from '@LearnCraft-Spanish/shared';
import type { SelectedCourseAndLessonsContextType } from '../contexts/SelectedCourseAndLessonsContext';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useCallback, useMemo, useState } from 'react';
import SelectedCourseAndLessonsContext from '../contexts/SelectedCourseAndLessonsContext';
export function SelectedCourseAndLessonsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: coursesWithLessons } = useCoursesWithLessons();
  const { appUser } = useActiveStudent();

  const [userSelectedCourse, setUserSelectedCourse] = useState<number | null>(
    null,
  );
  const [fromLesson, setFromLesson] = useState<Lesson | null>(null);
  const [toLesson, setToLesson] = useState<Lesson | null>(null);

  const course = useMemo(() => {
    let newCourseId: number;
    if (userSelectedCourse) {
      newCourseId = userSelectedCourse;
    } else {
      newCourseId = appUser?.courseId || 0;
    }
    return coursesWithLessons?.find((item) => item.id === newCourseId) || null;
  }, [coursesWithLessons, userSelectedCourse, appUser?.courseId]);

  // ------------------ Setters ------------------ //
  const updateLessonFactory = useCallback(
    (lessonId: number | null, setFunction: (lesson: Lesson | null) => void) => {
      if (!lessonId) {
        setFunction(null);
        return;
      }
      const newLesson =
        course?.lessons.find((lesson) => lesson.id === lessonId) || null;
      if (!newLesson?.id) {
        // Throw Error, or handle error
        return;
      }
      setFunction(newLesson);
    },
    [course],
  );

  const updateFromLesson = useCallback(
    (lessonId: number | null) => {
      updateLessonFactory(lessonId, setFromLesson);
    },
    [updateLessonFactory],
  );

  const updateToLesson = useCallback(
    (lessonId: number | null) => {
      updateLessonFactory(lessonId, setToLesson);
    },
    [updateLessonFactory],
  );

  const updateCourse = useCallback(
    (courseId: number) => {
      setUserSelectedCourse(courseId);
      updateFromLesson(null);

      const newToLessonId =
        appUser?.courseId === courseId ? appUser?.lessonNumber : null;
      updateToLesson(newToLessonId);
    },
    [
      appUser?.courseId,
      appUser?.lessonNumber,
      updateFromLesson,
      updateToLesson,
    ],
  );

  const value: SelectedCourseAndLessonsContextType = useMemo(
    () => ({
      course,
      fromLesson,
      toLesson,
      updateCourse,
      updateFromLesson,
      updateToLesson,
    }),
    [
      course,
      fromLesson,
      toLesson,
      updateCourse,
      updateFromLesson,
      updateToLesson,
    ],
  );

  return (
    <SelectedCourseAndLessonsContext value={value}>
      {children}
    </SelectedCourseAndLessonsContext>
  );
}
