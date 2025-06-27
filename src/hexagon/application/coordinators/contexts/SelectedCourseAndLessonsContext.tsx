import { createContext } from 'react';

interface SelectedCourseAndLessonsContextType {
  // States
  userSelectedCourseId: number | null;
  fromLessonId: number | null;
  toLessonId: number | null;

  // Actions
  updateUserSelectedCourseId: (courseId: number) => void;
  updateFromLessonId: (lessonId: number) => void;
  updateToLessonId: (lessonId: number) => void;

  // Memos
  // allowedVocabulary: VocabularyTag[];
  // requiredVocabulary: VocabularyTag[];
}

const SelectedCourseAndLessonsContext =
  createContext<SelectedCourseAndLessonsContextType | null>(null);

export type { SelectedCourseAndLessonsContextType };

export default SelectedCourseAndLessonsContext;
