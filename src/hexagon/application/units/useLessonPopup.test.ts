import type { UseCoursesWithLessonsReturn } from '@application/queries/useCoursesWithLessons';
import type { UseLessonsByVocabularyResult } from '@application/queries/useLessonsByVocab';
import type { ContextualMenuContextType } from '@composition/context/ContextualMenuContext';
import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import useLessonPopup from '@application/units/useLessonPopup';
import { renderHook } from '@testing-library/react';
import { createMockSpanishInOneMonthChallengeCourse } from '@testing/factories/courseFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Assigned in beforeEach; the mock factories below read them lazily at render time.
let lessonsByVocabularyValue: UseLessonsByVocabularyResult;
let contextualValue: ContextualMenuContextType;
let coursesWithLessonsValue: UseCoursesWithLessonsReturn;

vi.mock('@application/queries/useLessonsByVocab', () => ({
  useLessonsByVocabulary: vi.fn<
    (vocabId: number | null) => UseLessonsByVocabularyResult
  >(() => lessonsByVocabularyValue),
}));

vi.mock('@interface/hooks/useContextualMenu', () => ({
  useContextualMenu: vi.fn<() => ContextualMenuContextType>(
    () => contextualValue,
  ),
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

// The contextual key format the hook parses vocab ids out of: `vocabInfo-{exampleId}-{vocabId}`.
const CONTEXTUAL_VOCAB_KEY = 'vocabInfo-1-42';

describe('useLessonPopup', () => {
  beforeEach(() => {
    contextualValue = {
      contextual: CONTEXTUAL_VOCAB_KEY,
      openContextual: vi.fn(),
      closeContextual: vi.fn(),
      setContextualRef: vi.fn(),
      updateDisableClickOutside: vi.fn(),
    };
    lessonsByVocabularyValue = {
      lessonsByVocabulary: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    coursesWithLessonsValue = { data: [], isLoading: false, error: null };
  });

  describe('default (no options / scopeToRelevantCourses off)', () => {
    it('returns the raw lessons list untouched, in the order the query returned it', () => {
      const learncraftLessonTwo = lesson(2, 'LearnCraft Spanish', 2);
      const subjunctivesLesson = lesson(4, 'Subjunctives Challenge', 1);
      const learncraftLessonOne = lesson(1, 'LearnCraft Spanish', 1);
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [
          learncraftLessonTwo,
          subjunctivesLesson,
          learncraftLessonOne,
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      const { result } = renderHook(() => useLessonPopup());

      expect(result.current.lessonPopup.lessonsByVocabulary).toEqual([
        learncraftLessonTwo,
        subjunctivesLesson,
        learncraftLessonOne,
      ]);
    });

    it('does not set a currentCourseName', () => {
      const { result } = renderHook(() => useLessonPopup());

      expect(result.current.lessonPopup.currentCourseName).toBeUndefined();
    });

    it('reflects only the vocabulary lessons loading state', () => {
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
      };
      coursesWithLessonsValue = { data: [], isLoading: true, error: null };

      const { result } = renderHook(() => useLessonPopup({}));

      expect(result.current.lessonPopup.lessonsLoading).toBe(true);
    });

    it('behaves the same whether called with no arguments or an explicit false flag', () => {
      const onlyLesson = lesson(1, 'LearnCraft Spanish', 1);
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [onlyLesson],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };

      const noArgs = renderHook(() => useLessonPopup());
      const explicitFalse = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: false }),
      );

      expect(noArgs.result.current.lessonPopup).toEqual(
        explicitFalse.result.current.lessonPopup,
      );
    });
  });

  describe('scopeToRelevantCourses: true', () => {
    const learncraftSpanish = course(2, 'LearnCraft Spanish');
    const spanishInOneMonthChallenge =
      createMockSpanishInOneMonthChallengeCourse();
    // A different, older course; must stay excluded even though it is
    // published and its name looks similar to the challenge course.
    const spanishInOneMonth = course(3, 'Spanish in One Month');
    const subjunctivesChallenge = course(10, 'Subjunctives Challenge');
    const draftCourse = { ...course(99, 'Draft Course'), published: false };

    it('drops lessons from an unpublished course', () => {
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

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(result.current.lessonPopup.lessonsByVocabulary).toEqual([]);
    });

    it('drops published lessons from a non-whitelisted, non-active course', () => {
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
      overrideMockSelectedCourseAndLessons({ course: null, courseId: null });

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(result.current.lessonPopup.lessonsByVocabulary).toEqual([]);
    });

    it('keeps published lessons from the always-relevant whitelisted courses, including course 11 when present', () => {
      const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
      const challengeLesson =
        spanishInOneMonthChallenge.lessons[0] ??
        lesson(2, 'Spanish in One Month Challenge', 1);
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
      overrideMockSelectedCourseAndLessons({ course: null, courseId: null });

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(
        result.current.lessonPopup.lessonsByVocabulary.map((l) => l.id),
      ).toEqual(expect.arrayContaining([lcsLesson.id, challengeLesson.id]));
      expect(result.current.lessonPopup.lessonsByVocabulary).toHaveLength(2);
    });

    it('adds the active course when it is outside the whitelist, and lists it first', () => {
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

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(
        result.current.lessonPopup.lessonsByVocabulary.map((l) => l.id),
      ).toEqual([subjunctivesLesson.id, lcsLesson.id]);
      expect(result.current.lessonPopup.currentCourseName).toBe(
        'Subjunctives Challenge',
      );
    });

    it('does not duplicate the active course when it is already whitelisted', () => {
      const lcsLessonOne = lesson(1, 'LearnCraft Spanish', 1);
      const lcsLessonTwo = lesson(2, 'LearnCraft Spanish', 2);
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [lcsLessonTwo, lcsLessonOne],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
      coursesWithLessonsValue = {
        data: [{ ...learncraftSpanish, lessons: [lcsLessonOne, lcsLessonTwo] }],
        isLoading: false,
        error: null,
      };
      overrideMockSelectedCourseAndLessons({
        course: learncraftSpanish,
        courseId: learncraftSpanish.id,
      });

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(
        result.current.lessonPopup.lessonsByVocabulary.map((l) => l.id),
      ).toEqual([lcsLessonOne.id, lcsLessonTwo.id]);
    });

    it('is loading while either the vocabulary lessons or the course catalog load', () => {
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
      coursesWithLessonsValue = {
        data: undefined,
        isLoading: true,
        error: null,
      };

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      expect(result.current.lessonPopup.lessonsLoading).toBe(true);
    });

    it('degrades gracefully -- and does not open the gate -- when the catalog is empty', () => {
      const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
      lessonsByVocabularyValue = {
        lessonsByVocabulary: [lcsLesson],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
      coursesWithLessonsValue = { data: [], isLoading: false, error: null };
      overrideMockSelectedCourseAndLessons({ course: null, courseId: null });

      expect(() =>
        renderHook(() => useLessonPopup({ scopeToRelevantCourses: true })),
      ).not.toThrow();

      const { result } = renderHook(() =>
        useLessonPopup({ scopeToRelevantCourses: true }),
      );

      // `filterPublishedLessons` already drops everything when the catalog is
      // empty (no course to have published the lesson), so the list is empty
      // regardless of the relevant-courses filter.
      expect(result.current.lessonPopup.lessonsByVocabulary).toEqual([]);
    });
  });
});
