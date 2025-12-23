import type { ExtendedLesson } from '@interface/components/LessonSelector/SelectLesson';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { useMemo } from 'react';

export interface UseLocalFilterPanelLogicParams {
  selectedCourseId: number;
  fromLessonNumber: number;
  toLessonNumber: number;
}

export function useLocalFilterPanelLogic({
  selectedCourseId,
  fromLessonNumber,
  toLessonNumber,
}: UseLocalFilterPanelLogicParams) {
  const { data: coursesWithLessons } = useCoursesWithLessons();

  const course = useMemo(() => {
    return coursesWithLessons?.find((c) => c.id === selectedCourseId);
  }, [coursesWithLessons, selectedCourseId]);

  const toLesson = useMemo(() => {
    if (!course) return undefined;

    return course.lessons.find((l) => l.lessonNumber === toLessonNumber);
  }, [course, toLessonNumber]);

  const fromLesson = useMemo(() => {
    if (!course) return undefined;
    if (fromLessonNumber < 0) {
      // Virtual lesson
      const prerequisites = getPrerequisitesForCourse(course.id);
      if (!prerequisites) return undefined;
      const prereqIndex = prerequisites.prerequisites.findIndex(
        (_, index) =>
          generateVirtualLessonId(course.id, index) === fromLessonNumber,
      );
      if (prereqIndex === -1) return undefined;
      const prereq = prerequisites.prerequisites[prereqIndex];
      return {
        id: fromLessonNumber,
        lessonNumber: fromLessonNumber,
        courseName: prereq.courseName,
        isVirtual: true,
        displayName: prereq.displayName,
      } as ExtendedLesson;
    }
    return course.lessons.find((l) => l.lessonNumber === fromLessonNumber);
  }, [course, fromLessonNumber]);

  const fromLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }

    const prerequisites = getPrerequisitesForCourse(course.id);
    const virtualLessons: ExtendedLesson[] = prerequisites
      ? prerequisites.prerequisites.map((prereq, index) => ({
          id: generateVirtualLessonId(course.id, index),
          lessonNumber: generateVirtualLessonId(course.id, index),
          courseName: prereq.courseName,
          isVirtual: true,
          displayName: prereq.displayName,
        }))
      : [];

    // If no "To" lesson is selected, only show prerequisite options
    if (!toLesson) {
      return virtualLessons;
    }

    // If "To" lesson is selected, show prerequisites + filtered regular lessons
    const filteredLessons = course.lessons.filter(
      (lesson) => lesson.lessonNumber <= toLesson.lessonNumber,
    );

    return [...virtualLessons, ...filteredLessons];
  }, [course, toLesson]);

  const toLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }
    if (!fromLesson) {
      return course.lessons;
    }

    // If fromLesson is virtual, show all lessons in the target course
    if (fromLesson.lessonNumber < 0) {
      return course.lessons;
    }

    return course.lessons.filter((lesson) => {
      return lesson.lessonNumber >= fromLesson.lessonNumber;
    });
  }, [course, fromLesson]);

  const getDefaultLessonsForCourse = (courseId: number) => {
    const newCourse = coursesWithLessons?.find((c) => c.id === courseId);
    const firstLesson = newCourse?.lessons?.[0]?.lessonNumber ?? 0;
    const lastLesson =
      newCourse?.lessons?.[newCourse?.lessons.length - 1]?.lessonNumber ?? 0;

    const prerequisites = getPrerequisitesForCourse(courseId);
    const defaultFromLesson =
      prerequisites && prerequisites.prerequisites.length > 0
        ? generateVirtualLessonId(courseId, 0)
        : firstLesson;

    return {
      defaultToLesson: lastLesson,
      defaultFromLesson,
    };
  };

  return {
    course,
    toLesson,
    fromLesson,
    fromLessons,
    toLessons,
    getDefaultLessonsForCourse,
    coursesWithLessons,
  };
}
