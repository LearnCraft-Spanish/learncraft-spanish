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
  const [fromLessonNumber, setFromLessonNumber] = useState<number | null>(null);
  const [toLessonNumber, setToLessonNumber] = useState<number | null>(null);

  const updateUserSelectedCourseId = useCallback(
    (courseId: number) => {
      setUserSelectedCourseId(courseId);
      setFromLessonNumber(null);
      setToLessonNumber(null);
    },
    [setUserSelectedCourseId],
  );

  const updateFromLessonNumber = useCallback(
    (lessonNumber: number) => {
      setFromLessonNumber(lessonNumber);
    },
    [setFromLessonNumber],
  );

  const updateToLessonNumber = useCallback(
    (lessonNumber: number) => {
      setToLessonNumber(lessonNumber);
    },
    [setToLessonNumber],
  );

  const value: SelectedCourseAndLessonsContextType = useMemo(
    () => ({
      userSelectedCourseId,
      updateUserSelectedCourseId,
      fromLessonNumber,
      updateFromLessonNumber,
      toLessonNumber,
      updateToLessonNumber,
    }),
    [
      userSelectedCourseId,
      updateUserSelectedCourseId,
      fromLessonNumber,
      updateFromLessonNumber,
      toLessonNumber,
      updateToLessonNumber,
    ],
  );

  return (
    <SelectedCourseAndLessonsContext value={value}>
      {children}
    </SelectedCourseAndLessonsContext>
  );
}
