import type { LastStudiedLessonPort } from '@application/ports/lastStudiedLessonPort';
import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import { hashEmail } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { LastStudiedLessonRecordSchema } from '@domain/lastStudiedLesson/types';
import { createLocalStorageInfrastructure } from '@infrastructure/localStorageInfrastructure';

export const LAST_STUDIED_LESSON_STORAGE_KEY = 'lcs-last-studied-lesson';

export function createLastStudiedLessonInfrastructure(): LastStudiedLessonPort {
  const storage = createLocalStorageInfrastructure();

  const readRecord = (): LastStudiedLessonRecord | null => {
    try {
      const parsed = LastStudiedLessonRecordSchema.safeParse(
        storage.getItem(LAST_STUDIED_LESSON_STORAGE_KEY),
      );
      return parsed.success ? parsed.data : null;
    } catch {
      // getItem does a bare JSON.parse, which throws on malformed values
      return null;
    }
  };

  return {
    getLastStudiedLesson: async (email: string) => {
      const record = readRecord();
      if (!record || record.emailHash !== (await hashEmail(email))) {
        return null;
      }
      return record;
    },

    setLastStudiedLesson: async ({ email, courseId, lessonNumber }) => {
      const record: LastStudiedLessonRecord = {
        emailHash: await hashEmail(email),
        courseId,
        lessonNumber,
        updatedAt: new Date().toISOString(),
      };
      // A single key means each write replaces the previous entry
      storage.setItem(LAST_STUDIED_LESSON_STORAGE_KEY, record);
      return record;
    },

    clearLastStudiedLesson: async () => {
      storage.removeItem(LAST_STUDIED_LESSON_STORAGE_KEY);
    },
  };
}
