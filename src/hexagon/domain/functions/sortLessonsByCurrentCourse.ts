import type { Lesson } from '@learncraft-spanish/shared';

/**
 * Orders vocabulary-taught-in lessons so the student's current course is
 * listed first. Within a course, lessons stay in lesson-number order.
 */
export function sortLessonsByCurrentCourse(
  lessons: readonly Lesson[],
  currentCourseName: string | null,
): Lesson[] {
  const currentCourse =
    currentCourseName !== null && currentCourseName.length > 0
      ? currentCourseName
      : null;

  return [...lessons].sort((left, right) => {
    const leftIsCurrent =
      currentCourse !== null && left.courseName === currentCourse;
    const rightIsCurrent =
      currentCourse !== null && right.courseName === currentCourse;

    if (leftIsCurrent !== rightIsCurrent) {
      return leftIsCurrent ? -1 : 1;
    }

    const courseOrder = left.courseName.localeCompare(right.courseName);
    if (courseOrder !== 0) {
      return courseOrder;
    }

    return left.lessonNumber - right.lessonNumber;
  });
}
