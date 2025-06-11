import type { SelectedCourseAndLessonsContextType } from '../context/SelectedCourseAndLessonsContext';
import { use } from 'react';
import SelectedCourseAndLessonsContext from '../context/SelectedCourseAndLessonsContext';

export const useSelectedCourseAndLessons =
  (): SelectedCourseAndLessonsContextType => {
    const context = use(SelectedCourseAndLessonsContext);
    if (!context) {
      throw new Error(
        'useSelectedCourseAndLessons must be used within a SelectedCourseAndLessonsProvider',
      );
    }
    return context;
  };
