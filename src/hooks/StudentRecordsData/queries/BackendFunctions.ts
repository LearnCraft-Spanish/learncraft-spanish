import type { Lesson } from 'src/types/CoachingTypes';
import type { EditableLesson } from '../useLessonsTable';
import { useBackendHelpers } from 'src/hooks/useBackend';

export default function useStudentRecordsBackend() {
  const { getFactory, newPutFactory, newPostFactory } = useBackendHelpers();

  // get students table
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

  return {
    getLessonsTable,
    updateLesson,
    createLesson,
  };
}
