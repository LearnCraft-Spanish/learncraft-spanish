import type { Lesson } from 'src/types/CoachingTypes';

export type EditableLesson = Omit<Lesson, 'recordId'> & { recordId?: number };
export type NewLesson = Omit<Lesson, 'recordId'>;
