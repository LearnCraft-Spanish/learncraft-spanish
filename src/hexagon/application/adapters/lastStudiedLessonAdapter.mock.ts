import type { LastStudiedLessonPort } from '@application/ports/lastStudiedLessonPort';
import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import { hashEmail } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// In-memory stand-in for one localStorage item per hashed email
const storedRecords = new Map<string, LastStudiedLessonRecord>();

export const defaultMockLastStudiedLessonAdapter: LastStudiedLessonPort = {
  getLastStudiedLesson: async (email: string) => {
    const emailHash = await hashEmail(email);
    return storedRecords.get(emailHash) ?? null;
  },

  setLastStudiedLesson: async ({ email, courseId, lessonNumber }) => {
    const emailHash = await hashEmail(email);
    const record: LastStudiedLessonRecord = {
      emailHash,
      courseId,
      lessonNumber,
      updatedAt: new Date().toISOString(),
    };
    storedRecords.set(emailHash, record);
    return record;
  },

  clearLastStudiedLesson: async (email: string) => {
    storedRecords.delete(await hashEmail(email));
  },
};

const {
  mock: mockLastStudiedLessonAdapter,
  override: baseOverrideMockLastStudiedLessonAdapter,
  reset: baseResetMockLastStudiedLessonAdapter,
} = createOverrideableMock<LastStudiedLessonPort>(
  defaultMockLastStudiedLessonAdapter,
);

export interface SeedLastStudiedLessonInput {
  email: string;
  courseId: number;
  lessonNumber: number;
  updatedAt: string;
}

/** Seeds one in-memory record without wiping other emails. */
export const seedMockLastStudiedLesson = async (
  record: SeedLastStudiedLessonInput | null,
): Promise<void> => {
  if (!record) {
    storedRecords.clear();
    return;
  }
  const { email, courseId, lessonNumber, updatedAt } = record;
  const emailHash = await hashEmail(email);
  storedRecords.set(emailHash, {
    emailHash,
    courseId,
    lessonNumber,
    updatedAt,
  });
};

export const resetMockLastStudiedLessonAdapter = (): void => {
  storedRecords.clear();
  baseResetMockLastStudiedLessonAdapter();
};

export const overrideMockLastStudiedLessonAdapter =
  baseOverrideMockLastStudiedLessonAdapter;

export { mockLastStudiedLessonAdapter };
export default mockLastStudiedLessonAdapter;
