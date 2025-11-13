import type { SelectedCourseAndLessonsContextType } from '@application/coordinators/contexts/SelectedCourseAndLessonsContext';
import SelectedCourseAndLessonsContext from '@application/coordinators/contexts/SelectedCourseAndLessonsContext';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { useCallback, useMemo, useState } from 'react';

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
      setToLessonNumber(null);

      // Check if the course has prerequisites and auto-select the first one
      const prerequisites = getPrerequisitesForCourse(courseId);
      if (prerequisites && prerequisites.prerequisites.length > 0) {
        // Set the from lesson to the first prerequisite
        const firstPrerequisiteId = generateVirtualLessonId(courseId, 0);
        setFromLessonNumber(firstPrerequisiteId);
      } else {
        // No prerequisites, reset to null
        setFromLessonNumber(null);
      }
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
