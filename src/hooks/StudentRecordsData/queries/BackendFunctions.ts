import type { Course, Lesson } from 'src/types/CoachingTypes';
import type { EditableCourse } from '../useCoursesTable';
import type { EditableLesson } from '../useLessonsTable';
// import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useStudentRecordsBackend() {
  // const { getFactory, newPutFactory, newPostFactory } = useBackendHelpers();

  // get lessons table
  const getLessonsTable = (): Promise<Lesson[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<Lesson[]>('student-records/lessons');
  };

  const updateLesson = (_lesson: EditableLesson): Promise<Lesson> => {
    throw new Error('This feature is not available at this time.');
    // return newPutFactory<Lesson>({ path: 'student-records/lessons', body: _lesson });
  };

  const createLesson = (_lesson: EditableLesson): Promise<Lesson> => {
    throw new Error('This feature is not available at this time.');
    // return newPostFactory<Lesson>({ path: 'student-records/lessons', body: _lesson });
  };

  // get courses table
  const getCoursesTable = (): Promise<Course[]> => {
    throw new Error('This feature is not available at this time.');
    // return getFactory<Course[]>('student-records/courses');
  };

  const updateCourse = (_course: EditableCourse): Promise<Course> => {
    throw new Error('This feature is not available at this time.');
    // return newPutFactory<Course>({ path: 'student-records/courses', body: _course });
  };

  const createCourse = (_course: EditableCourse): Promise<Course> => {
    throw new Error('This feature is not available at this time.');
    // return newPostFactory<Course>({ path: 'student-records/courses', body: _course });
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
