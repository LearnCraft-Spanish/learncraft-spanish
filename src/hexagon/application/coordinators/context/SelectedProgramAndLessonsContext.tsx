// import type { Course, Lesson } from 'src/types/CoachingTypes';
import type {
  Lesson,
  ProgramWithLessons,
  VocabularyTag,
} from '@LearnCraft-Spanish/shared';
import { createContext } from 'react';

interface SelectedProgramAndLessonsContextType {
  // States
  program: ProgramWithLessons | null;
  fromLesson: Lesson | null;
  toLesson: Lesson | null;

  // Actions
  updateProgram: (program: ProgramWithLessons) => void;
  updateFromLesson: (lesson: Lesson) => void;
  updateToLesson: (lesson: Lesson) => void;

  // Memos
  allowedVocabulary: VocabularyTag[];
  requiredVocabulary: VocabularyTag[];
}

const SelectedProgramAndLessonsContext =
  createContext<SelectedProgramAndLessonsContextType | null>(null);

export type { SelectedProgramAndLessonsContextType };

export default SelectedProgramAndLessonsContext;
