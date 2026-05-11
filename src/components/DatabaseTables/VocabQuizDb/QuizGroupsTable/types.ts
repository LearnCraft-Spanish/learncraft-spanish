import type { AdminQuizGroup } from '@learncraft-spanish/shared';

export type EditableQuizGroup = AdminQuizGroup;

export interface QuizGroupObjForUpdate {
  id: number;
  name: string;
  urlSlug: string;
  courseId: number | null;
  published: boolean;
}

export interface NewQuizGroup {
  name: string;
  urlSlug: string;
  published: boolean;
}
