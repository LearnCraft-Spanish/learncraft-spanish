import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import type { UseSelectedCourseAndLessonsReturnType } from './types';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { getPrerequisiteFromVirtualId } from '@domain/coursePrerequisites';
import { use, useMemo } from 'react';
import SelectedCourseAndLessonsContext from '../contexts/SelectedCourseAndLessonsContext';
import { useActiveStudent } from './useActiveStudent';

export function useSelectedCourseAndLessons(): UseSelectedCourseAndLessonsReturnType {
  const context = use(SelectedCourseAndLessonsContext);
  if (!context) {
    throw new Error(
      'useSelectedCourseAndLessons must be used within a SelectedCourseAndLessonsProvider',
    );
  }
  const {
    userSelectedCourseId,
    updateUserSelectedCourseId,
    fromLessonNumber,
    updateFromLessonNumber,
    toLessonNumber,
    updateToLessonNumber,
  } = context;

  const {
    data: coursesWithLessons,
    isLoading,
    error,
  } = useCoursesWithLessons();
  const { appUser } = useActiveStudent();

  const course: CourseWithLessons | null = useMemo(() => {
    let newCourseId: number | null;

    if (userSelectedCourseId || userSelectedCourseId === 0) {
      newCourseId = userSelectedCourseId;
    } else {
      // If the appUser is a student, use their courseId & lessonNumber
      if (appUser && appUser.studentRole === 'student' && appUser.courseId) {
        newCourseId = appUser.courseId;
      } else {
        // If they are not a student, default to 'LearnCraft Spanish' course
        newCourseId =
          coursesWithLessons?.find((c) => c.name === 'LearnCraft Spanish')
            ?.id ?? null;
      }
    }
    return coursesWithLessons?.find((item) => item.id === newCourseId) || null;
  }, [coursesWithLessons, userSelectedCourseId, appUser]);

  const fromLesson: Lesson | null = useMemo(() => {
    if (!course) {
      return null;
    }

    if (fromLessonNumber) {
      // Handle virtual prerequisite lessons (negative numbers)
      if (fromLessonNumber < 0) {
        const prerequisite = getPrerequisiteFromVirtualId(fromLessonNumber);
        if (prerequisite) {
          // Return a virtual lesson object for UI display
          return {
            id: fromLessonNumber,
            lessonNumber: fromLessonNumber,
            courseName: prerequisite.displayName,
          } as Lesson;
        }
      }

      return (
        course.lessons.find((item) => item.lessonNumber === fromLessonNumber) ||
        course.lessons[0]
      );
    }
    if (fromLessonNumber === 0) {
      return null;
    }

    // Default to the first lesson of the course
    return course.lessons[0] || null;
  }, [course, fromLessonNumber]);

  const toLesson: Lesson | null = useMemo(() => {
    if (!course) {
      return null;
    }

    let newToLessonNumber: number | undefined;

    if (toLessonNumber) {
      newToLessonNumber = toLessonNumber;
    } else if (
      appUser &&
      appUser.studentRole === 'student' &&
      appUser.courseId === course?.id &&
      appUser.lessonNumber
    ) {
      // If the appUser is a student, use their lessonNumber
      newToLessonNumber = appUser.lessonNumber;
    } else if (toLessonNumber === 0) {
      return null;
    } else {
      // If they are not a student, check if course is "LearnCraft Spanish"
      if (course?.name === 'LearnCraft Spanish') {
        newToLessonNumber = 2; // Default to lesson 2 for LearnCraft Spanish
      } else {
        newToLessonNumber = course?.lessons[0]?.lessonNumber; // Default to first lesson for other courses
      }
    }

    return (
      course?.lessons.find((item) => item.lessonNumber === newToLessonNumber) ||
      null
    );
  }, [course, toLessonNumber, appUser]);

  // ------------------ Return ------------------ //
  return {
    course,
    courseId: course?.id ?? null,
    fromLesson,
    fromLessonNumber: fromLesson?.lessonNumber ?? null,
    toLesson,
    toLessonNumber: toLesson?.lessonNumber ?? null,
    updateUserSelectedCourseId,
    updateFromLessonNumber,
    updateToLessonNumber,
    isLoading,
    error,
  };
}
