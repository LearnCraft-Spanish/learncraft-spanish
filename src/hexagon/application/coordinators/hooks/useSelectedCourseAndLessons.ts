import type { UseSelectedCourseAndLessonsReturnType } from '@application/coordinators/hooks/types';
import type { CourseWithLessons, Lesson } from '@learncraft-spanish/shared';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import SelectedCourseAndLessonsContext from '@application/coordinators/contexts/SelectedCourseAndLessonsContext';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import { getPrerequisiteFromVirtualId } from '@domain/coursePrerequisites';
import { resolveLastStudiedLessonNumber } from '@domain/lastStudiedLesson/lastStudiedLesson';
import { use, useMemo } from 'react';

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

  const { exampleFilters } = use(ExampleFilterContext);
  const includeUnpublished = exampleFilters.includeUnpublished ?? false;

  const {
    data: coursesWithLessons,
    isLoading,
    error,
  } = useCoursesWithLessons(includeUnpublished);
  const { appUser } = useActiveStudent();
  const { lastStudiedLesson, isLoading: lastStudiedLessonLoading } =
    useLastStudiedLessonQuery();

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

    const lastStudiedLessonNumber = resolveLastStudiedLessonNumber(
      lastStudiedLesson,
      course.id,
    );

    if (toLessonNumber) {
      newToLessonNumber = toLessonNumber;
    } else if (toLessonNumber === 0) {
      // Explicit "–Choose Lesson–" clears the To-lesson for this session
      return null;
    } else if (lastStudiedLessonNumber) {
      // Where the student left off last session takes precedence over their
      // recorded course progress
      newToLessonNumber = lastStudiedLessonNumber;
    } else if (
      appUser &&
      appUser.studentRole === 'student' &&
      appUser.courseId === course?.id &&
      appUser.lessonNumber
    ) {
      // If the appUser is a student, use their lessonNumber
      newToLessonNumber = appUser.lessonNumber;
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
  }, [course, toLessonNumber, appUser, lastStudiedLesson]);

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
    includeUnpublished,
    isLoading: isLoading || lastStudiedLessonLoading,
    error,
  };
}
