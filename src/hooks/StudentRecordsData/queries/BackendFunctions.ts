import type { Course, Lesson } from 'src/types/CoachingTypes';
import type { EditableCourse } from '../useCoursesTable';
import type { EditableLesson } from '../useLessonsTable';
import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useStudentRecordsBackend() {
  const { getFactory, newPutFactory, newPostFactory } = useBackendHelpers();

  // get lessons table
  const getLessonsTable = () => {
    return getFactory<Lesson[]>('student-records/lessons');
  };

  const updateLesson = (lesson: EditableLesson) => {
    return newPutFactory<Lesson>({
      path: 'student-records/lessons',
      body: lesson,
    });
  };

  const createLesson = (lesson: EditableLesson) => {
    return newPostFactory<Lesson>({
      path: 'student-records/lessons',
      body: lesson,
    });
  };

  // get courses table
  const getCoursesTable = () => {
    return getFactory<Course[]>('student-records/courses');
  };

  const updateCourse = (course: EditableCourse) => {
    return newPutFactory<Course>({
      path: 'student-records/courses',
      body: course,
    });
  };

  const createCourse = (course: EditableCourse) => {
    return newPostFactory<Course>({
      path: 'student-records/courses',
      body: course,
    });
  };

  return {
    getLessonsTable,
    updateLesson,
    createLesson,
    getCoursesTable,
    updateCourse,
    createCourse,
  };
}
