import { sortLessonsByCurrentCourse } from '@domain/functions/sortLessonsByCurrentCourse';
import { describe, expect, it } from 'vitest';

function lesson(
  id: number,
  courseName: string,
  lessonNumber: number,
): { id: number; courseName: string; lessonNumber: number } {
  return { id, courseName, lessonNumber };
}

describe('sortLessonsByCurrentCourse', () => {
  it('puts the current course first, then other courses by name', () => {
    const later = lesson(9, 'Later course', 14);
    const current = lesson(2, 'LearnCraft Spanish', 8);
    const earlierOther = lesson(3, '1-Month Challenge', 1);

    expect(
      sortLessonsByCurrentCourse(
        [later, earlierOther, current],
        'LearnCraft Spanish',
      ),
    ).toEqual([current, earlierOther, later]);
  });

  it('sorts lessons in the current course by lesson number', () => {
    const late = lesson(4, 'LearnCraft Spanish', 12);
    const early = lesson(1, 'LearnCraft Spanish', 2);

    expect(
      sortLessonsByCurrentCourse([late, early], 'LearnCraft Spanish'),
    ).toEqual([early, late]);
  });

  it('sorts only by course name and lesson number when no current course is set', () => {
    const zeta = lesson(9, 'Zeta course', 14);
    const alphaLate = lesson(3, 'Alpha course', 8);
    const alphaEarly = lesson(2, 'Alpha course', 1);

    expect(
      sortLessonsByCurrentCourse([zeta, alphaLate, alphaEarly], null),
    ).toEqual([alphaEarly, alphaLate, zeta]);
  });

  it('does not mutate the input list', () => {
    const first = lesson(9, 'Later course', 14);
    const second = lesson(2, 'LearnCraft Spanish', 2);
    const input = [first, second];

    sortLessonsByCurrentCourse(input, 'LearnCraft Spanish');

    expect(input).toEqual([first, second]);
  });
});
