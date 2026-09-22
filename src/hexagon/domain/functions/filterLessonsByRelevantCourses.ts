import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';

/**
 * Courses whose lessons always belong on a vocab tag's "Taught in" list,
 * regardless of the student's active course. `Lesson` has no `courseId` --
 * only `courseName` -- so these ids are resolved to names through the course
 * catalog by `resolveRelevantCourseNames` rather than hardcoded as strings.
 * See `domain/coursePrerequisites.ts` for the precedent of hardcoding course
 * ids in the domain layer.
 *
 * NOTE: course id 3 ("Spanish in One Month") is a different, older course and
 * is deliberately NOT included here.
 */
export const ALWAYS_RELEVANT_COURSE_IDS: readonly number[] = [
  2, // LearnCraft Spanish
  11, // Spanish in One Month Challenge
];

/**
 * Resolves the always-relevant course ids, plus the student's active course
 * (when it isn't already one of them), to the `courseName`s the catalog
 * knows about.
 *
 * A whitelisted id that is absent from `courses` contributes no name -- it
 * must not throw, and it must not cause the filter to fall back to allowing
 * everything.
 */
export function resolveRelevantCourseNames(
  courses: readonly CourseWithLessons[],
  activeCourseId: number | null | undefined,
): ReadonlySet<string> {
  const relevantCourseIds = new Set<number>(ALWAYS_RELEVANT_COURSE_IDS);
  if (activeCourseId !== null && activeCourseId !== undefined) {
    relevantCourseIds.add(activeCourseId);
  }

  const relevantCourseNames = new Set<string>();
  for (const course of courses) {
    if (relevantCourseIds.has(course.id)) {
      relevantCourseNames.add(course.name);
    }
  }
  return relevantCourseNames;
}

/**
 * Drops lessons whose course is neither always-relevant nor the student's
 * active course. Matching goes through `courseName` (via
 * `resolveRelevantCourseNames`) because `Lesson` has no `courseId`.
 */
export function filterLessonsByRelevantCourses(
  lessons: readonly Lesson[],
  courses: readonly CourseWithLessons[],
  activeCourseId: number | null | undefined,
): Lesson[] {
  const relevantCourseNames = resolveRelevantCourseNames(
    courses,
    activeCourseId,
  );
  return lessons.filter((lesson) => relevantCourseNames.has(lesson.courseName));
}
