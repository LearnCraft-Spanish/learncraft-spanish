import type {
  LastStudiedLessonInput,
  LastStudiedLessonRecord,
} from '@domain/lastStudiedLesson/types';

/**
 * Persistence for a user's last studied lesson.
 *
 * Callers pass the Auth0 email. Phase 1 stores one localStorage item per
 * SHA-256 email hash (`lcs-last-studied-lesson:${emailHash}`) so free users
 * (no postgres record) can persist a lesson without writing the address, and
 * so two students sharing a browser keep independent records.
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
  clearLastStudiedLesson: (email: string) => Promise<void>;
}
