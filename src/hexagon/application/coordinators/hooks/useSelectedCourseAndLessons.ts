import type { SelectedCourseAndLessonsContextType } from '../contexts/SelectedCourseAndLessonsContext';
import { use } from 'react';
import SelectedCourseAndLessonsContext from '../contexts/SelectedCourseAndLessonsContext';

export function useSelectedCourseAndLessons(): SelectedCourseAndLessonsContextType {
  const context = use(SelectedCourseAndLessonsContext);
  if (!context) {
    throw new Error(
      'useSelectedCourseAndLessons must be used within a SelectedCourseAndLessonsProvider',
    );
  }
  return context;
}
