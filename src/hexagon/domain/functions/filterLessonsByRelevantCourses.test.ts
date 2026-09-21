import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import {
  filterLessonsByRelevantCourses,
  resolveRelevantCourseNames,
} from '@domain/functions/filterLessonsByRelevantCourses';
import { describe, expect, it } from 'vitest';

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

describe('filterLessonsByRelevantCourses', () => {
  const learncraftSpanish = course(2, 'LearnCraft Spanish');
  const spanishInOneMonthChallenge = course(
    11,
    'Spanish in One Month Challenge',
  );
  // A different, older course that shares no id with the whitelist and must
  // stay excluded even though its name looks similar.
  const spanishInOneMonth = course(3, 'Spanish in One Month');
  const subjunctivesChallenge = course(10, 'Subjunctives Challenge');

  const catalog = [
    learncraftSpanish,
    spanishInOneMonthChallenge,
    spanishInOneMonth,
    subjunctivesChallenge,
  ];

  it('keeps lessons from the always-relevant whitelisted courses', () => {
    const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
    const challengeLesson = lesson(2, 'Spanish in One Month Challenge', 1);

    expect(
      filterLessonsByRelevantCourses(
        [lcsLesson, challengeLesson],
        catalog,
        null,
      ),
    ).toEqual([lcsLesson, challengeLesson]);
  });

  it('drops lessons from a non-whitelisted, non-active course', () => {
    const olderCourseLesson = lesson(3, 'Spanish in One Month', 1);
    const subjunctivesLesson = lesson(4, 'Subjunctives Challenge', 1);

    expect(
      filterLessonsByRelevantCourses(
        [olderCourseLesson, subjunctivesLesson],
        catalog,
        null,
      ),
    ).toEqual([]);
  });

  it('adds the active course when it is outside the whitelist', () => {
    const subjunctivesLesson = lesson(4, 'Subjunctives Challenge', 1);
    const olderCourseLesson = lesson(3, 'Spanish in One Month', 1);

    expect(
      filterLessonsByRelevantCourses(
        [subjunctivesLesson, olderCourseLesson],
        catalog,
        subjunctivesChallenge.id,
      ),
    ).toEqual([subjunctivesLesson]);
  });

  it('does not duplicate the active course when it is already whitelisted', () => {
    const lcsLessonOne = lesson(1, 'LearnCraft Spanish', 1);
    const lcsLessonTwo = lesson(5, 'LearnCraft Spanish', 2);

    const names = resolveRelevantCourseNames(catalog, learncraftSpanish.id);
    expect(names.size).toBe(2); // LearnCraft Spanish + Spanish in One Month Challenge only

    expect(
      filterLessonsByRelevantCourses(
        [lcsLessonOne, lcsLessonTwo],
        catalog,
        learncraftSpanish.id,
      ),
    ).toEqual([lcsLessonOne, lcsLessonTwo]);
  });

  it('contributes nothing for a whitelisted id missing from the catalog, without throwing or opening the gate', () => {
    const catalogWithoutChallenge = [learncraftSpanish, spanishInOneMonth];
    const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
    const otherCourseLesson = lesson(6, 'Some Other Course', 1);

    expect(() =>
      filterLessonsByRelevantCourses(
        [lcsLesson, otherCourseLesson],
        catalogWithoutChallenge,
        null,
      ),
    ).not.toThrow();

    expect(
      filterLessonsByRelevantCourses(
        [lcsLesson, otherCourseLesson],
        catalogWithoutChallenge,
        null,
      ),
    ).toEqual([lcsLesson]);
  });

  it('allows nothing when the catalog is empty', () => {
    const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);

    expect(filterLessonsByRelevantCourses([lcsLesson], [], null)).toEqual([]);
    expect(resolveRelevantCourseNames([], null).size).toBe(0);
  });

  it('does not mutate the input list', () => {
    const lcsLesson = lesson(1, 'LearnCraft Spanish', 1);
    const otherCourseLesson = lesson(6, 'Some Other Course', 1);
    const input = [lcsLesson, otherCourseLesson];

    filterLessonsByRelevantCourses(input, catalog, null);

    expect(input).toEqual([lcsLesson, otherCourseLesson]);
  });
});
