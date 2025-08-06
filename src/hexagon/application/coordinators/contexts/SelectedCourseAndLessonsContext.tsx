import { createContext } from 'react';

interface SelectedCourseAndLessonsContextType {
  // States
  userSelectedCourseId: number | null;
  fromLessonNumber: number | null;
  toLessonNumber: number | null;

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
