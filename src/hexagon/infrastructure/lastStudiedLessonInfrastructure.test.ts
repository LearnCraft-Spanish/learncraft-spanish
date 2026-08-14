import { hashEmail } from '@domain/lastStudiedLesson/lastStudiedLesson';
import {
  createLastStudiedLessonInfrastructure,
  lastStudiedLessonStorageKey,
} from '@infrastructure/lastStudiedLessonInfrastructure';
import { afterEach, describe, expect, it } from 'vitest';

const STUDENT_A = 'student-lcsp@fake.not';
const STUDENT_B = 'limited@fake.not';

function createPort() {
  return createLastStudiedLessonInfrastructure();
}

afterEach(() => {
  localStorage.clear();
});

describe('createLastStudiedLessonInfrastructure', () => {
  it('stores one localStorage item per hashed email', async () => {
    const port = createPort();
    await port.setLastStudiedLesson({
      email: STUDENT_A,
      courseId: 2,
      lessonNumber: 5,
    });
    await port.setLastStudiedLesson({
      email: STUDENT_B,
      courseId: 3,
      lessonNumber: 8,
    });

    const hashA = await hashEmail(STUDENT_A);
    const hashB = await hashEmail(STUDENT_B);
    expect(localStorage.getItem(lastStudiedLessonStorageKey(hashA))).not.toBe(
      null,
    );
    expect(localStorage.getItem(lastStudiedLessonStorageKey(hashB))).not.toBe(
      null,
    );
    expect(hashA).not.toBe(hashB);
  });

  it('keeps student A after student B writes', async () => {
    const port = createPort();
    await port.setLastStudiedLesson({
      email: STUDENT_A,
      courseId: 2,
      lessonNumber: 5,
    });
    await port.setLastStudiedLesson({
      email: STUDENT_B,
      courseId: 3,
      lessonNumber: 8,
    });

    const recordA = await port.getLastStudiedLesson(STUDENT_A);
    const recordB = await port.getLastStudiedLesson(STUDENT_B);
    expect(recordA?.lessonNumber).toBe(5);
    expect(recordA?.courseId).toBe(2);
    expect(recordB?.lessonNumber).toBe(8);
    expect(recordB?.courseId).toBe(3);
  });

  it('clears only the requested email', async () => {
    const port = createPort();
    await port.setLastStudiedLesson({
      email: STUDENT_A,
      courseId: 2,
      lessonNumber: 5,
    });
    await port.setLastStudiedLesson({
      email: STUDENT_B,
      courseId: 3,
      lessonNumber: 8,
    });

    await port.clearLastStudiedLesson(STUDENT_A);

    expect(await port.getLastStudiedLesson(STUDENT_A)).toBe(null);
    expect((await port.getLastStudiedLesson(STUDENT_B))?.lessonNumber).toBe(8);
  });
});
