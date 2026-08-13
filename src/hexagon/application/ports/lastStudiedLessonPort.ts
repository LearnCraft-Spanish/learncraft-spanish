import type {
  LastStudiedLessonInput,
  LastStudiedLessonRecord,
} from '@domain/lastStudiedLesson/types';

/**
 * Persistence for a user's last studied lesson.
 *
 * Callers pass the Auth0 email. The infrastructure stores a SHA-256 hash of
 * that email so free users (no postgres record) can persist a lesson without
 * writing the address to localStorage.
 *
 * The signatures are async even though the phase 1 localStorage write is
 * synchronous, so replacing it with an HTTP implementation requires no
 * changes above this boundary.
 */
export interface LastStudiedLessonPort {
  getLastStudiedLesson: (
    email: string,
  ) => Promise<LastStudiedLessonRecord | null>;
  setLastStudiedLesson: (
    input: LastStudiedLessonInput,
  ) => Promise<LastStudiedLessonRecord>;
  clearLastStudiedLesson: () => Promise<void>;
}
