import {
  COURSES_WITH_PREREQUISITES,
  getPrerequisiteLessonRanges,
} from '@domain/coursePrerequisites';
import { describe, expect, it } from 'vitest';

const POST_PODCAST_LESSONS_COURSE_ID = 7;
const LEARNCRAFT_SPANISH_COURSE_ID = 2;

describe('getPrerequisiteLessonRanges', () => {
  it('returns the full lesson range of each prerequisite course', () => {
    expect(getPrerequisiteLessonRanges(POST_PODCAST_LESSONS_COURSE_ID)).toEqual(
      [
        {
          courseId: LEARNCRAFT_SPANISH_COURSE_ID,
          fromLessonNumber: 1,
          toLessonNumber: 250,
        },
      ],
    );
  });

  it('returns an empty list for a course without prerequisites', () => {
    expect(getPrerequisiteLessonRanges(LEARNCRAFT_SPANISH_COURSE_ID)).toEqual(
      [],
    );
  });

  it.each([[null], [undefined], [0]])(
    'returns an empty list for a missing course id (%s)',
    (courseId) => {
      expect(getPrerequisiteLessonRanges(courseId)).toEqual([]);
    },
  );

  it('covers every configured course with prerequisites', () => {
    for (const config of COURSES_WITH_PREREQUISITES) {
      const ranges = getPrerequisiteLessonRanges(config.targetCourseId);

      expect(ranges).toHaveLength(config.prerequisites.length);
      expect(
        ranges.every((range) => range.courseId !== config.targetCourseId),
      ).toBe(true);
    }
  });
});
