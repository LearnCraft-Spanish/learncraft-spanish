import type { Lesson } from 'src/types/DatabaseTables';

export type EditableLesson = Lesson;

export interface LessonObjForUpdate {
  lesson: string;
  lessonNumber: number;
  subtitle: string;
  published: boolean;
  recordId: number;
}

// new lesson
export interface NewLesson {
  lesson: string;
  lessonNumber: number;
  subtitle: string;
  published: boolean;
}
