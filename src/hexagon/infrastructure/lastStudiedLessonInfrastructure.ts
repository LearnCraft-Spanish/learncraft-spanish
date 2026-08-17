import type { LastStudiedLessonPort } from '@application/ports/lastStudiedLessonPort';
import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import { hashEmail } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { LastStudiedLessonRecordSchema } from '@domain/lastStudiedLesson/types';
import { createLocalStorageInfrastructure } from '@infrastructure/localStorageInfrastructure';

export const LAST_STUDIED_LESSON_STORAGE_KEY = 'lcs-last-studied-lesson';

export function lastStudiedLessonStorageKey(emailHash: string): string {
  return `${LAST_STUDIED_LESSON_STORAGE_KEY}:${emailHash}`;
}

export function createLastStudiedLessonInfrastructure(): LastStudiedLessonPort {
  const storage = createLocalStorageInfrastructure();

  const readRecord = (emailHash: string): LastStudiedLessonRecord | null => {
    try {
      const parsed = LastStudiedLessonRecordSchema.safeParse(
        storage.getItem(lastStudiedLessonStorageKey(emailHash)),
      );
      return parsed.success ? parsed.data : null;
    } catch {
      // getItem does a bare JSON.parse, which throws on malformed values
      return null;
    }
  };

  return {
    getLastStudiedLesson: async (email: string) => {
      const emailHash = await hashEmail(email);
      const record = readRecord(emailHash);
      if (!record || record.emailHash !== emailHash) {
        return null;
      }
      return record;
    },

    setLastStudiedLesson: async ({ email, courseId, lessonNumber }) => {
      const emailHash = await hashEmail(email);
      const record: LastStudiedLessonRecord = {
        emailHash,
        courseId,
        lessonNumber,
        updatedAt: new Date().toISOString(),
      };
      storage.setItem(lastStudiedLessonStorageKey(emailHash), record);
      return record;
    },

    clearLastStudiedLesson: async (email: string) => {
      const emailHash = await hashEmail(email);
      storage.removeItem(lastStudiedLessonStorageKey(emailHash));
    },
  };
}
