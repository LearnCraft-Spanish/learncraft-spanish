import type { LastStudiedLessonPort } from '@application/ports/lastStudiedLessonPort';
import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import { hashEmail } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// In-memory stand-in for the single localStorage entry
let storedRecord: LastStudiedLessonRecord | null = null;

export const defaultMockLastStudiedLessonAdapter: LastStudiedLessonPort = {
  getLastStudiedLesson: async (email: string) =>
    storedRecord && storedRecord.emailHash === (await hashEmail(email))
      ? storedRecord
      : null,

  setLastStudiedLesson: async ({ email, courseId, lessonNumber }) => {
    storedRecord = {
      emailHash: await hashEmail(email),
      courseId,
      lessonNumber,
      updatedAt: new Date().toISOString(),
    };
    return storedRecord;
  },

  clearLastStudiedLesson: async () => {
    storedRecord = null;
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

/** Seeds the in-memory record, as if a previous session had saved it. */
export const seedMockLastStudiedLesson = async (
  record: SeedLastStudiedLessonInput | null,
): Promise<void> => {
  if (!record) {
    storedRecord = null;
    return;
  }
  const { email, courseId, lessonNumber, updatedAt } = record;
  storedRecord = {
    emailHash: await hashEmail(email),
    courseId,
    lessonNumber,
    updatedAt,
  };
};

export const resetMockLastStudiedLessonAdapter = (): void => {
  storedRecord = null;
  baseResetMockLastStudiedLessonAdapter();
};

export const overrideMockLastStudiedLessonAdapter =
  baseOverrideMockLastStudiedLessonAdapter;

export { mockLastStudiedLessonAdapter };
export default mockLastStudiedLessonAdapter;
