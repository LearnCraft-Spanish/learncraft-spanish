import type { SelectedCourseAndLessonsContextType } from '../contexts/SelectedCourseAndLessonsContext';
import { useCallback, useMemo, useState } from 'react';
import SelectedCourseAndLessonsContext from '../contexts/SelectedCourseAndLessonsContext';

export function SelectedCourseAndLessonsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userSelectedCourseId, setUserSelectedCourseId] = useState<
    number | null
  >(null);
  const [fromLessonId, setFromLessonId] = useState<number | null>(null);
  const [toLessonId, setToLessonId] = useState<number | null>(null);

  const updateUserSelectedCourseId = useCallback(
    (courseId: number) => {
      setUserSelectedCourseId(courseId);
    },
    [setUserSelectedCourseId],
  );

  const updateFromLessonId = useCallback(
    (lessonId: number) => {
      setFromLessonId(lessonId);
    },
    [setFromLessonId],
  );

  const updateToLessonId = useCallback(
    (lessonId: number) => {
      setToLessonId(lessonId);
    },
    [setToLessonId],
  );

  const value: SelectedCourseAndLessonsContextType = useMemo(
    () => ({
      userSelectedCourseId,
      updateUserSelectedCourseId,
      fromLessonId,
      updateFromLessonId,
      toLessonId,
      updateToLessonId,
    }),
    [
      userSelectedCourseId,
      updateUserSelectedCourseId,
      fromLessonId,
      updateFromLessonId,
      toLessonId,
      updateToLessonId,
    ],
  );

  return (
    <SelectedCourseAndLessonsContext value={value}>
      {children}
    </SelectedCourseAndLessonsContext>
  );
}
