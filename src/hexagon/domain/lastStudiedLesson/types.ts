import { z } from 'zod';

/**
 * A user's most recently studied lesson.
 *
 * Phase 1 persists this in localStorage, so the schema is used to validate
 * untrusted JSON at the storage boundary. The owner is the SHA-256 hash of
 * the Auth0 email (free users have no postgres row). Phase 2 moves this type
 * to `@learncraft-spanish/shared` as part of the API contract.
 */
export const LastStudiedLessonRecordSchema = z.object({
  emailHash: z.string().regex(/^[a-f0-9]{64}$/),
  courseId: z.number().int(),
  lessonNumber: z.number().int(),
  updatedAt: z.string(),
});

export type LastStudiedLessonRecord = z.infer<
  typeof LastStudiedLessonRecordSchema
>;

export interface LastStudiedLessonInput {
  email: string;
  courseId: number;
  lessonNumber: number;
}
