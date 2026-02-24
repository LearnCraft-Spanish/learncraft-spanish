import type { QuizGroup } from 'src/types/DatabaseTables';

export type EditableQuizGroup = QuizGroup;

export interface QuizGroupObjForUpdate {
  name: string;
  published: boolean;
  recordId: number;
}

// new quiz group - includes urlSlug since it can only be set on creation
export interface NewQuizGroup {
  name: string;
  urlSlug: string;
  published: boolean;
}
