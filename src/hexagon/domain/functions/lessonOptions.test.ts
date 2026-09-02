import type { CourseWithLessons } from '@learncraft-spanish/shared';
import {
  courseOptions,
  fromLessonOptions,
  lessonLabel,
  listedCourses,
  startFromLesson,
  toLessonOptions,
  virtualLessons,
} from '@domain/functions/lessonOptions';
import { describe, expect, it } from 'vitest';

function makeCourse(
  overrides: Partial<CourseWithLessons> = {},
): CourseWithLessons {
  return {
    id: 2,
    name: 'LearnCraft Spanish',
    lessons: [
      { lessonNumber: 1 },
      { lessonNumber: 2 },
      { lessonNumber: 3 },
    ] as CourseWithLessons['lessons'],
    ...overrides,
  } as CourseWithLessons;
}

describe('lessonLabel', () => {
  it('falls back to a numbered label when no display name is set', () => {
    expect(lessonLabel({ lessonNumber: 4 })).toBe('Lesson 4');
  });

  it('uses the display name when present', () => {
    expect(lessonLabel({ lessonNumber: 4, displayName: 'Intro' })).toBe(
      'Intro',
    );
  });
});

describe('virtualLessons', () => {
  it('is empty for a course with no configured prerequisites', () => {
    expect(virtualLessons(makeCourse({ id: 999 }))).toEqual([]);
  });

  it('exposes prerequisite courses as pseudo-lessons', () => {
    const result = virtualLessons(makeCourse({ id: 5 }));
    expect(result).toEqual([
      { lessonNumber: -5001, displayName: 'All si1m Lessons (1-20)' },
    ]);
  });
});

describe('startFromLesson', () => {
  it('is null without a course', () => {
    expect(startFromLesson(null)).toBeNull();
  });

  it('is the first real lesson when there are no prerequisites', () => {
    expect(startFromLesson(makeCourse())).toEqual({ lessonNumber: 1 });
  });

  it('is the first prerequisite when the course has one', () => {
    expect(startFromLesson(makeCourse({ id: 5 }))).toEqual({
      lessonNumber: -5001,
      displayName: 'All si1m Lessons (1-20)',
    });
  });

  it('is null when the course has no lessons at all', () => {
    expect(startFromLesson(makeCourse({ lessons: [] }))).toBeNull();
  });
});

describe('listedCourses', () => {
  const course = makeCourse();

  it('prefers the multi-course catalog when it has entries', () => {
    const other = makeCourse({ id: 3, name: 'Spanish in One Month' });
    expect(listedCourses([course, other], null)).toEqual([course, other]);
  });

  it('falls back to the single selected course', () => {
    expect(listedCourses([], course)).toEqual([course]);
    expect(listedCourses(null, course)).toEqual([course]);
  });

  it('is empty with no catalog and no selected course', () => {
    expect(listedCourses(null, null)).toEqual([]);
  });
});

describe('courseOptions', () => {
  it('maps listed courses to value/label options', () => {
    const course = makeCourse();
    expect(courseOptions(null, course)).toEqual([
      { value: '2', label: 'LearnCraft Spanish' },
    ]);
  });
});

describe('toLessonOptions', () => {
  it('is empty without a course', () => {
    expect(toLessonOptions(null, null)).toEqual([]);
  });

  it('lists every lesson when there is no lower bound', () => {
    expect(toLessonOptions(makeCourse(), null)).toEqual([
      { value: '1', label: 'Lesson 1' },
      { value: '2', label: 'Lesson 2' },
      { value: '3', label: 'Lesson 3' },
    ]);
  });

  it('filters out lessons below the from-lesson number', () => {
    expect(toLessonOptions(makeCourse(), 2)).toEqual([
      { value: '2', label: 'Lesson 2' },
      { value: '3', label: 'Lesson 3' },
    ]);
  });
});

describe('fromLessonOptions', () => {
  it('is empty without a course', () => {
    expect(fromLessonOptions(null, null)).toEqual([]);
  });

  it('labels the earliest option as the start of the course', () => {
    expect(fromLessonOptions(makeCourse(), 2)).toEqual([
      { value: '1', label: 'Lesson 1 — from the start' },
      { value: '2', label: 'Lesson 2' },
    ]);
  });

  it('leads with prerequisite courses when configured', () => {
    const result = fromLessonOptions(makeCourse({ id: 5 }), 1);
    expect(result[0]).toEqual({
      value: '-5001',
      label: 'All si1m Lessons (1-20) — from the start',
    });
  });
});
