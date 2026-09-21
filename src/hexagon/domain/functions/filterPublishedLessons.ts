import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

function isPublishedLesson(
  lesson: Lesson,
  publishedCourses: readonly CourseWithLessons[],
): boolean {
  return publishedCourses.some(
    (course) =>
      course.published &&
      course.lessons.some(
        (publishedLesson) =>
          publishedLesson.id === lesson.id ||
          (publishedLesson.courseName === lesson.courseName &&
            publishedLesson.lessonNumber === lesson.lessonNumber),
      ),
  );
}

/**
 * Drops lessons that belong to an unpublished course, or that are not yet
 * on a published course's lesson list.
 */
export function filterPublishedLessons(
  lessons: readonly Lesson[],
  courses: readonly CourseWithLessons[],
): Lesson[] {
  return lessons.filter((lesson) => isPublishedLesson(lesson, courses));
}
