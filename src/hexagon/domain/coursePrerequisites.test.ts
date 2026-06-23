import {
  courseHasPrerequisites,
  generateVirtualLessonId,
  getPrerequisiteFromVirtualId,
  getPrerequisitesForCourse,
  parseVirtualLessonId,
  transformToLessonRanges,
} from '@domain/coursePrerequisites';
import { describe, expect, it } from 'vitest';

describe('coursePrerequisites', () => {
  describe('getPrerequisitesForCourse', () => {
    it('returns config for course 5 (Post-Challenge Lessons)', () => {
      const result = getPrerequisitesForCourse(5);
      expect(result).not.toBeNull();
      expect(result!.targetCourseId).toBe(5);
      expect(result!.prerequisites).toHaveLength(1);
      expect(result!.prerequisites[0].courseId).toBe(3);
    });

    it('returns config for course 7 (Post-Podcast Lessons)', () => {
      const result = getPrerequisitesForCourse(7);
      expect(result).not.toBeNull();
      expect(result!.targetCourseId).toBe(7);
      expect(result!.prerequisites[0].courseId).toBe(2);
    });

    it('returns null for an unknown course', () => {
      expect(getPrerequisitesForCourse(999)).toBeNull();
    });
  });

  describe('courseHasPrerequisites', () => {
    it('returns true for courses with prerequisites', () => {
      expect(courseHasPrerequisites(5)).toBe(true);
      expect(courseHasPrerequisites(7)).toBe(true);
    });

    it('returns false for a course with no prerequisites', () => {
      expect(courseHasPrerequisites(2)).toBe(false);
    });
  });

  describe('generateVirtualLessonId / parseVirtualLessonId round-trip', () => {
    it('round-trips course 5, index 0', () => {
      const virtualId = generateVirtualLessonId(5, 0);
      expect(virtualId).toBeLessThan(0);
      const parsed = parseVirtualLessonId(virtualId);
      expect(parsed).toEqual({ targetCourseId: 5, prerequisiteIndex: 0 });
    });

    it('round-trips course 7, index 0', () => {
      const virtualId = generateVirtualLessonId(7, 0);
      const parsed = parseVirtualLessonId(virtualId);
      expect(parsed).toEqual({ targetCourseId: 7, prerequisiteIndex: 0 });
    });
  });

  describe('parseVirtualLessonId', () => {
    it('returns null for a positive (real) lesson ID', () => {
      expect(parseVirtualLessonId(42)).toBeNull();
    });

    it('returns null for zero', () => {
      expect(parseVirtualLessonId(0)).toBeNull();
    });
  });

  describe('getPrerequisiteFromVirtualId', () => {
    it('returns the si1m prerequisite for course 5', () => {
      const virtualId = generateVirtualLessonId(5, 0);
      const prereq = getPrerequisiteFromVirtualId(virtualId);
      expect(prereq).not.toBeNull();
      expect(prereq!.courseId).toBe(3);
      expect(prereq!.fromLessonNumber).toBe(1);
      expect(prereq!.toLessonNumber).toBe(20);
    });

    it('returns null for a positive lesson ID', () => {
      expect(getPrerequisiteFromVirtualId(42)).toBeNull();
    });

    it('returns null when prerequisite index is out of bounds', () => {
      const virtualId = generateVirtualLessonId(5, 99);
      expect(getPrerequisiteFromVirtualId(virtualId)).toBeNull();
    });
  });

  describe('transformToLessonRanges', () => {
    it('returns empty array when courseId is missing', () => {
      expect(
        transformToLessonRanges({
          courseId: null,
          fromLessonNumber: 1,
          toLessonNumber: 10,
        }),
      ).toEqual([]);
    });

    it('returns empty array when toLessonNumber is missing', () => {
      expect(
        transformToLessonRanges({
          courseId: 2,
          fromLessonNumber: 1,
          toLessonNumber: null,
        }),
      ).toEqual([]);
    });

    it('returns a single range for a regular lesson selection', () => {
      const result = transformToLessonRanges({
        courseId: 2,
        fromLessonNumber: 10,
        toLessonNumber: 20,
      });
      expect(result).toEqual([
        { courseId: 2, fromLessonNumber: 10, toLessonNumber: 20 },
      ]);
    });

    it('defaults fromLessonNumber to 1 when not provided', () => {
      const result = transformToLessonRanges({
        courseId: 2,
        fromLessonNumber: null,
        toLessonNumber: 50,
      });
      expect(result).toEqual([
        { courseId: 2, fromLessonNumber: 1, toLessonNumber: 50 },
      ]);
    });

    it('returns prerequisite range + target range for a virtual lesson ID', () => {
      const virtualId = generateVirtualLessonId(5, 0);
      const result = transformToLessonRanges({
        courseId: 5,
        fromLessonNumber: virtualId,
        toLessonNumber: 15,
      });
      // Should produce: prerequisite course range, then the target course range
      expect(result).toHaveLength(2);
      expect(result[0].courseId).toBe(3); // si1m
      expect(result[0].fromLessonNumber).toBe(1);
      expect(result[0].toLessonNumber).toBe(20);
      expect(result[1].courseId).toBe(5);
      expect(result[1].fromLessonNumber).toBe(1);
      expect(result[1].toLessonNumber).toBe(15);
    });
  });
});
