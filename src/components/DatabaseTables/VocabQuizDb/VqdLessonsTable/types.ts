import type { Lesson } from 'src/types/DatabaseTables';

export type EditableLesson = Lesson;

export interface LessonObjForUpdate {
  lesson: string;
  lessonNumber: number;
  published: boolean;
  recordId: number;
}

export interface NewLesson {
  lesson: string;
  lessonNumber: number;
  published: boolean;
}
