import { filterPublishedLessons } from '@domain/functions/filterPublishedLessons';
import { describe, expect, it } from 'vitest';

function lesson(
  id: number,
  courseName: string,
  lessonNumber: number,
): { id: number; courseName: string; lessonNumber: number } {
  return { id, courseName, lessonNumber };
}

describe('filterPublishedLessons', () => {
  const publishedCourse = {
    id: 2,
    name: 'LearnCraft Spanish',
    published: true,
    lessons: [lesson(71, 'LearnCraft Spanish', 2)],
  };
  const unpublishedCourse = {
    id: 99,
    name: 'Draft Course',
    published: false,
    lessons: [lesson(900, 'Draft Course', 1)],
  };

  it('keeps lessons that exist on a published course', () => {
    const published = lesson(71, 'LearnCraft Spanish', 2);

    expect(
      filterPublishedLessons([published], [publishedCourse, unpublishedCourse]),
    ).toEqual([published]);
  });

  it('drops lessons from an unpublished course', () => {
    const draft = lesson(900, 'Draft Course', 1);

    expect(
      filterPublishedLessons([draft], [publishedCourse, unpublishedCourse]),
    ).toEqual([]);
  });

  it('drops a lesson number that is not on the published course yet', () => {
    const unpublishedLesson = lesson(80, 'LearnCraft Spanish', 99);

    expect(
      filterPublishedLessons([unpublishedLesson], [publishedCourse]),
    ).toEqual([]);
  });

  it('does not mutate the input list', () => {
    const published = lesson(71, 'LearnCraft Spanish', 2);
    const draft = lesson(900, 'Draft Course', 1);
    const input = [published, draft];

    filterPublishedLessons(input, [publishedCourse, unpublishedCourse]);

    expect(input).toEqual([published, draft]);
  });
});
