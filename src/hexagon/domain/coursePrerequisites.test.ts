import { lessonNumberAfterFilterReset } from '@domain/coursePrerequisites';
import { describe, expect, it } from 'vitest';

describe('lessonNumberAfterFilterReset', () => {
  it('returns null when no course is selected', () => {
    expect(lessonNumberAfterFilterReset(null)).toBeNull();
  });

  it('returns the virtual prerequisite lesson for a course that has prerequisites', () => {
    expect(
      lessonNumberAfterFilterReset({
        id: 7,
        name: 'Post-Podcast Lessons',
        published: true,
        lessons: [
          { id: 1, lessonNumber: 4, courseName: 'Post-Podcast Lessons' },
        ],
      }),
    ).toBe(-7001);
  });

  it('returns the first lesson number for a course without prerequisites', () => {
    expect(
      lessonNumberAfterFilterReset({
        id: 2,
        name: 'LearnCraft Spanish',
        published: true,
        lessons: [
          { id: 71, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
          { id: 79, lessonNumber: 10, courseName: 'LearnCraft Spanish' },
        ],
      }),
    ).toBe(3);
  });

  it('returns null when the course has no lessons and no prerequisites', () => {
    expect(
      lessonNumberAfterFilterReset({
        id: 2,
        name: 'LearnCraft Spanish',
        published: true,
        lessons: [],
      }),
    ).toBeNull();
  });
});
