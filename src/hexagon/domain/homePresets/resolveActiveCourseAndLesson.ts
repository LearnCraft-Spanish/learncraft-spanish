import type { ActiveCourseAndLesson } from '@domain/homePresets/types';
import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import type { AppUser } from '@learncraft-spanish/shared';
import { resolveLastStudiedLessonNumber } from '@domain/lastStudiedLesson/lastStudiedLesson';

/**
 * Read-only resolution of the course and lesson that drive the student home
 * screen. Deliberately ignores session dropdown overrides in
 * `useSelectedCourseAndLessons` so changing a filter elsewhere cannot change
 * which home buttons appear.
 *
 * Precedence (matching existing app behavior):
 * - Course comes from `appUser.courseId` only.
 * - Lesson prefers the stored last-studied lesson when its course matches,
 *   otherwise `appUser.lessonNumber`.
 *
 * Returns nulls unless the user is an enrolled student with a course id.
 */
export function resolveActiveCourseAndLesson({
  appUser,
  lastStudiedLesson,
}: {
  appUser: AppUser | null;
  lastStudiedLesson: LastStudiedLessonRecord | null;
}): ActiveCourseAndLesson {
  if (!appUser || appUser.studentRole !== 'student' || !appUser.courseId) {
    return { courseId: null, lessonNumber: null };
  }

  const courseId = appUser.courseId;
  const storedLessonNumber = resolveLastStudiedLessonNumber(
    lastStudiedLesson,
    courseId,
  );

  const lessonNumber = storedLessonNumber ?? appUser.lessonNumber ?? null;

  return { courseId, lessonNumber };
}
