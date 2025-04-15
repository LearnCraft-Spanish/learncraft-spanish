import type { Lesson } from 'src/types/CoachingTypes';

export type EditableLesson = Omit<Lesson, 'recordId'> & { recordId?: number };
export type NewLesson = Omit<Lesson, 'recordId'>;

/* ------------------ EditLessonView ------------------ */
export type LessonType =
  | 'LCSP'
  | '1MC/2MC'
  | 'ACCSP'
  | 'COMPREHENSION'
  | 'ADVANCED';
