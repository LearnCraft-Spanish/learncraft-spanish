import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { SelectOption } from '@interface/components/general/Select/Select';
import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';

export interface NamedLesson {
  lessonNumber: number;
  displayName?: string;
}

export function lessonLabel(lesson: NamedLesson): string {
  if (lesson.displayName !== undefined) {
    return lesson.displayName;
  }
  return `Lesson ${lesson.lessonNumber}`;
}

/**
 * Prerequisite courses shown as pseudo-lessons at the head of the from-lesson
 * list, so "start from the beginning" can reach across a course boundary.
 */
export function virtualLessons(course: CourseWithLessons): NamedLesson[] {
  const config = getPrerequisitesForCourse(course.id);
  if (!config) {
    return [];
  }
  return config.prerequisites.map((prereq, index) => ({
    lessonNumber: generateVirtualLessonId(course.id, index),
    displayName: prereq.displayName,
  }));
}

export function startFromLesson(
  course: CourseWithLessons | null,
): NamedLesson | null {
  if (!course) {
    return null;
  }
  const virtual = virtualLessons(course);
  if (virtual[0]) {
    return virtual[0];
  }
  const first = course.lessons[0];
  if (!first) {
    return null;
  }
  return { lessonNumber: first.lessonNumber };
}

export function listedCourses(
  exampleFilter: UseCombinedFiltersReturnType,
): CourseWithLessons[] {
  if (
    exampleFilter.coursesWithLessons &&
    exampleFilter.coursesWithLessons.length > 0
  ) {
    return exampleFilter.coursesWithLessons;
  }
  return exampleFilter.course ? [exampleFilter.course] : [];
}

export function courseOptions(
  exampleFilter: UseCombinedFiltersReturnType,
): SelectOption[] {
  return listedCourses(exampleFilter).map((listed) => ({
    value: String(listed.id),
    label: listed.name,
  }));
}

export function toLessonOptions(
  course: CourseWithLessons | null,
  fromLessonNumber: number | null,
): SelectOption[] {
  if (!course) {
    return [];
  }
  const lessons: Lesson[] =
    fromLessonNumber === null || fromLessonNumber < 0
      ? course.lessons
      : course.lessons.filter(
          (lesson) => lesson.lessonNumber >= fromLessonNumber,
        );
  return lessons.map((lesson) => ({
    value: String(lesson.lessonNumber),
    label: lessonLabel(lesson),
  }));
}

export function fromLessonOptions(
  course: CourseWithLessons | null,
  toLessonNumber: number | null,
): SelectOption[] {
  if (!course) {
    return [];
  }
  const start = startFromLesson(course);
  const regular =
    toLessonNumber === null
      ? []
      : course.lessons.filter(
          (lesson) => lesson.lessonNumber <= toLessonNumber,
        );
  return [...virtualLessons(course), ...regular].map((lesson) => {
    const base = lessonLabel(lesson);
    const isStart =
      start !== null && lesson.lessonNumber === start.lessonNumber;
    return {
      value: String(lesson.lessonNumber),
      label: isStart ? `${base} — from the start` : base,
    };
  });
}
