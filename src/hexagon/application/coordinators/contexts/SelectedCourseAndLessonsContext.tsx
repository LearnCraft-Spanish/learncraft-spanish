import { createContext } from 'react';

interface SelectedCourseAndLessonsContextType {
  // States
  userSelectedCourseId: number | null | undefined; // undefined before user makes selection, null when user selects the "choose course" option, number when user selects a course
  fromLessonNumber: number | null | undefined; // undefined before user makes selection, null when user selects the "choose lesson" option, number when user selects a lesson
  toLessonNumber: number | null | undefined; // undefined before user makes selection, null when user selects the "choose lesson" option, number when user selects a lesson

  // Actions
  updateUserSelectedCourseId: (courseId: number) => void;
  updateFromLessonNumber: (lessonNumber: number) => void;
  updateToLessonNumber: (lessonNumber: number) => void;

  // Memos
  // allowedVocabulary: VocabularyTag[];
  // requiredVocabulary: VocabularyTag[];
}

const SelectedCourseAndLessonsContext =
  createContext<SelectedCourseAndLessonsContextType | null>(null);

export type { SelectedCourseAndLessonsContextType };

export default SelectedCourseAndLessonsContext;
