import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import type { AppUser } from '@learncraft-spanish/shared';
import { resolveActiveCourseAndLesson } from '@domain/homePresets/resolveActiveCourseAndLesson';
import { describe, expect, it } from 'vitest';

const PLACEHOLDER_EMAIL_HASH = '0'.repeat(64);

function makeAppUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    name: 'Test Student',
    emailAddress: 'student@fake.not',
    recordId: 1,
    courseId: 2,
    lessonNumber: 10,
    studentRole: 'student',
    ...overrides,
  };
}

function makeRecord(
  overrides: Partial<LastStudiedLessonRecord> = {},
): LastStudiedLessonRecord {
  return {
    emailHash: PLACEHOLDER_EMAIL_HASH,
    courseId: 2,
    lessonNumber: 15,
    updatedAt: '2026-08-13T00:00:00.000Z',
    ...overrides,
  };
}

describe('resolveActiveCourseAndLesson', () => {
  it('returns nulls when there is no app user', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: null,
        lastStudiedLesson: makeRecord(),
      }),
    ).toEqual({ courseId: null, lessonNumber: null });
  });

  it('returns nulls when the user is not an enrolled student', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ studentRole: 'limited' }),
        lastStudiedLesson: null,
      }),
    ).toEqual({ courseId: null, lessonNumber: null });

    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ studentRole: 'none' }),
        lastStudiedLesson: null,
      }),
    ).toEqual({ courseId: null, lessonNumber: null });
  });

  it('returns nulls when the student has no course id', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ courseId: 0 }),
        lastStudiedLesson: null,
      }),
    ).toEqual({ courseId: null, lessonNumber: null });
  });

  it('uses appUser course and lesson when nothing is stored', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ courseId: 2, lessonNumber: 10 }),
        lastStudiedLesson: null,
      }),
    ).toEqual({ courseId: 2, lessonNumber: 10 });
  });

  it('prefers the stored lesson over appUser lesson progress', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ courseId: 2, lessonNumber: 10 }),
        lastStudiedLesson: makeRecord({ courseId: 2, lessonNumber: 22 }),
      }),
    ).toEqual({ courseId: 2, lessonNumber: 22 });
  });

  it('ignores a stored lesson recorded against a different course', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ courseId: 2, lessonNumber: 10 }),
        lastStudiedLesson: makeRecord({ courseId: 3, lessonNumber: 22 }),
      }),
    ).toEqual({ courseId: 2, lessonNumber: 10 });
  });

  it('never lets localStorage override the course id', () => {
    expect(
      resolveActiveCourseAndLesson({
        appUser: makeAppUser({ courseId: 2, lessonNumber: 10 }),
        lastStudiedLesson: makeRecord({ courseId: 5, lessonNumber: 1 }),
      }),
    ).toEqual({ courseId: 2, lessonNumber: 10 });
  });
});
