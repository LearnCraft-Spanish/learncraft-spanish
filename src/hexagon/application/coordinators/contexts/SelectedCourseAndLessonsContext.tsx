// import type { Course, Lesson } from 'src/types/CoachingTypes';
import type { CourseWithLessons, Lesson } from '@LearnCraft-Spanish/shared';
import { createContext } from 'react';

interface SelectedCourseAndLessonsContextType {
  // States
  course: CourseWithLessons | null;
  fromLesson: Lesson | null;
  toLesson: Lesson | null;

  // Actions
  updateCourse: (courseId: number) => void;
  updateFromLesson: (lessonId: number) => void;
  updateToLesson: (lessonId: number) => void;

  // Memos
  // allowedVocabulary: VocabularyTag[];
  // requiredVocabulary: VocabularyTag[];
}

const SelectedCourseAndLessonsContext =
  createContext<SelectedCourseAndLessonsContextType | null>(null);

export type { SelectedCourseAndLessonsContextType };

export default SelectedCourseAndLessonsContext;
