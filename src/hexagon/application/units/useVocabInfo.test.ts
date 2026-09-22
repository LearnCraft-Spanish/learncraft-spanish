import type { UseCoursesWithLessonsReturn } from '@application/queries/useCoursesWithLessons';
import type { UseLessonsByVocabularyResult } from '@application/queries/useLessonsByVocab';
import type {
  CourseWithLessons,
  Lesson,
  Vocabulary,
} from '@learncraft-spanish/shared';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useVocabInfo } from '@application/units/useVocabInfo';
import { renderHook } from '@testing-library/react';
import { createMockSpanishInOneMonthChallengeCourse } from '@testing/factories/courseFactory';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Assigned in beforeEach; the mock factories below read them lazily at render time.
let lessonsByVocabularyValue: UseLessonsByVocabularyResult;
let coursesWithLessonsValue: UseCoursesWithLessonsReturn;

vi.mock('@application/queries/useLessonsByVocab', () => ({
  useLessonsByVocabulary: vi.fn<
    (vocabId: number | null) => UseLessonsByVocabularyResult
  >(() => lessonsByVocabularyValue),
}));

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: vi.fn<
    (includeUnpublished?: boolean) => UseCoursesWithLessonsReturn
  >(() => coursesWithLessonsValue),
}));

function lesson(id: number, courseName: string, lessonNumber: number): Lesson {
  return { id, courseName, lessonNumber };
}

function course(
  id: number,
  name: string,
  lessons: Lesson[] = [],
): CourseWithLessons {
  return { id, name, published: true, lessons };
}

const VOCAB: Vocabulary = createMockVocabulary({
  word: 'cuando',
  descriptor: '"cuando": "when"',
  type: 'nonverb',
});

describe('useVocabInfo', () => {
  beforeEach(() => {
    lessonsByVocabularyValue = {
      lessonsByVocabulary: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = { data: [], isLoading: false, error: null };
    overrideMockSelectedCourseAndLessons({ course: null, courseId: null });
  });

  it('keeps published lessons from the always-relevant whitelisted courses, including course 11', () => {
    const learncraftSpanish = course(2, 'LearnCraft Spanish');
    const spanishInOneMonthChallenge =
      createMockSpanishInOneMonthChallengeCourse();
    const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
    const challengeLesson = spanishInOneMonthChallenge.lessons[0]!;

    lessonsByVocabularyValue = {
      lessonsByVocabulary: [lcsLesson, challengeLesson],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = {
      data: [
        { ...learncraftSpanish, lessons: [lcsLesson] },
        spanishInOneMonthChallenge,
      ],
      isLoading: false,
      error: null,
    };

    const { result } = renderHook(() => useVocabInfo(VOCAB));

    expect(result.current.lessons?.map((l) => l.id)).toEqual(
      expect.arrayContaining([lcsLesson.id, challengeLesson.id]),
    );
    expect(result.current.lessons).toHaveLength(2);
  });

  it('drops published lessons from a non-whitelisted, non-active course', () => {
    const spanishInOneMonth = course(3, 'Spanish in One Month');
    const olderCourseLesson = lesson(1, 'Spanish in One Month', 1);

    lessonsByVocabularyValue = {
      lessonsByVocabulary: [olderCourseLesson],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = {
      data: [{ ...spanishInOneMonth, lessons: [olderCourseLesson] }],
      isLoading: false,
      error: null,
    };

    const { result } = renderHook(() => useVocabInfo(VOCAB));

    expect(result.current.lessons).toEqual([]);
  });

  it('adds the active course when it is outside the whitelist, and lists it first', () => {
    const learncraftSpanish = course(2, 'LearnCraft Spanish');
    const subjunctivesChallenge = course(10, 'Subjunctives Challenge');
    const subjunctivesLesson = lesson(1, 'Subjunctives Challenge', 1);
    const lcsLesson = lesson(2, 'LearnCraft Spanish', 1);

    lessonsByVocabularyValue = {
      lessonsByVocabulary: [lcsLesson, subjunctivesLesson],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = {
      data: [
        { ...learncraftSpanish, lessons: [lcsLesson] },
        { ...subjunctivesChallenge, lessons: [subjunctivesLesson] },
      ],
      isLoading: false,
      error: null,
    };
    overrideMockSelectedCourseAndLessons({
      course: subjunctivesChallenge,
      courseId: subjunctivesChallenge.id,
    });

    const { result } = renderHook(() => useVocabInfo(VOCAB));

    expect(result.current.lessons?.map((l) => l.id)).toEqual([
      subjunctivesLesson.id,
      lcsLesson.id,
    ]);
    expect(result.current.currentCourseName).toBe('Subjunctives Challenge');
  });

  it('drops lessons from an unpublished course', () => {
    const draftCourse = { ...course(99, 'Draft Course'), published: false };
    const draftLesson = lesson(900, 'Draft Course', 1);

    lessonsByVocabularyValue = {
      lessonsByVocabulary: [draftLesson],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = {
      data: [{ ...draftCourse, lessons: [draftLesson] }],
      isLoading: false,
      error: null,
    };

    const { result } = renderHook(() => useVocabInfo(VOCAB));

    expect(result.current.lessons).toEqual([]);
  });

  it('reflects loading while either the vocabulary lessons or the course catalog load', () => {
    lessonsByVocabularyValue = {
      lessonsByVocabulary: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = { data: undefined, isLoading: true, error: null };

    const { result } = renderHook(() => useVocabInfo(VOCAB));

    expect(result.current.lessonsLoading).toBe(true);
  });
});
