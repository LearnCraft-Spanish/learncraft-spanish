import type { LastStudiedLessonRecord } from '@domain/lastStudiedLesson/types';
import type { CourseWithLessons } from '@learncraft-spanish/shared';
import {
  deriveLessonNumberFromQuiz,
  hashEmail,
  resolveLastStudiedLessonNumber,
} from '@domain/lastStudiedLesson/lastStudiedLesson';
import { describe, expect, it } from 'vitest';

const PLACEHOLDER_EMAIL_HASH = '0'.repeat(64);

function makeRecord(
  overrides: Partial<LastStudiedLessonRecord> = {},
): LastStudiedLessonRecord {
  return {
    emailHash: PLACEHOLDER_EMAIL_HASH,
    courseId: 2,
    lessonNumber: 7,
    updatedAt: '2026-08-13T00:00:00.000Z',
    ...overrides,
  };
}

function makeCourse(lessonNumbers: number[]): CourseWithLessons {
  return {
    id: 2,
    name: 'LearnCraft Spanish',
    published: true,
    lessons: lessonNumbers.map((lessonNumber, index) => ({
      id: index + 1,
      courseName: 'LearnCraft Spanish',
      lessonNumber,
    })),
  };
}

describe('resolveLastStudiedLessonNumber', () => {
  it('returns the lesson number when the record matches the course', () => {
    expect(resolveLastStudiedLessonNumber(makeRecord(), 2)).toBe(7);
  });

  it('returns null when the record belongs to a different course', () => {
    expect(
      resolveLastStudiedLessonNumber(makeRecord({ courseId: 99 }), 2),
    ).toBe(null);
  });

  it('returns null when there is no record', () => {
    expect(resolveLastStudiedLessonNumber(null, 2)).toBe(null);
    expect(resolveLastStudiedLessonNumber(undefined, 2)).toBe(null);
  });

  it('returns null when there is no course', () => {
    expect(resolveLastStudiedLessonNumber(makeRecord(), null)).toBe(null);
    expect(resolveLastStudiedLessonNumber(makeRecord(), undefined)).toBe(null);
  });
});

describe('deriveLessonNumberFromQuiz', () => {
  it('returns the quiz number when a lesson with that number exists', () => {
    const course = makeCourse([1, 2, 3, 4, 5]);
    expect(deriveLessonNumberFromQuiz({ quizNumber: 3, course })).toBe(3);
  });

  it('returns null when the course numbers quizzes differently', () => {
    // Subjunctives Challenge: quizzes 101/201/301 over lessons 1/2/3
    const course = makeCourse([1, 2, 3]);
    expect(deriveLessonNumberFromQuiz({ quizNumber: 101, course })).toBe(null);
    expect(deriveLessonNumberFromQuiz({ quizNumber: 302, course })).toBe(null);
  });

  it('returns null when the course has no lessons', () => {
    expect(
      deriveLessonNumberFromQuiz({ quizNumber: 1, course: makeCourse([]) }),
    ).toBe(null);
  });

  it('returns null when there is no course', () => {
    expect(deriveLessonNumberFromQuiz({ quizNumber: 1, course: null })).toBe(
      null,
    );
    expect(
      deriveLessonNumberFromQuiz({ quizNumber: 1, course: undefined }),
    ).toBe(null);
  });
});

describe('hashEmail', () => {
  it('returns a 64-character lowercase hex digest', async () => {
    const digest = await hashEmail('student-lcsp@fake.not');
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is stable for the same address', async () => {
    const first = await hashEmail('student-lcsp@fake.not');
    const second = await hashEmail('student-lcsp@fake.not');
    expect(first).toBe(second);
  });

  it('normalizes case and surrounding whitespace', async () => {
    const canonical = await hashEmail('student-lcsp@fake.not');
    expect(await hashEmail('  Student-LCSP@Fake.Not  ')).toBe(canonical);
  });

  it('produces different hashes for different addresses', async () => {
    const student = await hashEmail('student-lcsp@fake.not');
    const limited = await hashEmail('limited@fake.not');
    expect(student).not.toBe(limited);
  });
});
