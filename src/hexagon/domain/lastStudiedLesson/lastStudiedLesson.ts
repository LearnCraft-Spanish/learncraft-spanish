import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import type { CourseWithLessons } from '@learncraft-spanish/shared';

/**
 * Domain logic for resolving a user's last studied lesson.
 */

/**
 * SHA-256 hex digest of an email, used as the localStorage owner key so the
 * address itself is never persisted. Normalized to lowercase/trimmed so
 * equivalent addresses produce the same hash.
 *
 * Allowed domain exception: `crypto.subtle.digest` is Web Crypto's SHA-256
 * algorithm, not the network/persistence "API calls" BOUNDARIES.md forbids.
 * It is deterministic and in-memory (same input → same hex digest), with no
 * network, no persistence, and no React. The call is async only because that
 * is how the platform exposes SHA-256.
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalized),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns the stored lesson number only when the record belongs to the course
 * being viewed. Lesson numbers are only meaningful within a single course, so a
 * record from another course must not leak into that course's defaults.
 */
export function resolveLastStudiedLessonNumber(
  record: LastStudiedLessonRecord | null | undefined,
  courseId: number | null | undefined,
): number | null {
  if (!record || !courseId) {
    return null;
  }
  return record.courseId === courseId ? record.lessonNumber : null;
}

/**
 * Maps an official quiz to the lesson it covers.
 *
 * Standard courses (LearnCraft Spanish, Spanish in One Month, Post-Challenge)
 * number their quizzes to match their lessons. Some courses do not: the
 * Subjunctives Challenge uses 101/201/301 and Ser-Estar uses composite numbers.
 * Requiring the lesson to exist in the course keeps those courses from
 * recording a lesson number their students never selected.
 */
export function deriveLessonNumberFromQuiz({
  quizNumber,
  course,
}: {
  quizNumber: number;
  course: CourseWithLessons | null | undefined;
}): number | null {
  if (!course) {
    return null;
  }
  const hasMatchingLesson = course.lessons.some(
    (lesson) => lesson.lessonNumber === quizNumber,
  );
  return hasMatchingLesson ? quizNumber : null;
}
