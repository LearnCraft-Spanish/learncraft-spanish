import type { AdminQuizRecord } from '@learncraft-spanish/shared';

export type EditableQuiz = AdminQuizRecord;

export interface QuizObjForUpdate {
  id: number;
  quizNickname: string;
  published: boolean;
  relatedQuizGroupId: number | null;
}

export interface NewQuiz {
  quizNickname: string;
  published: boolean;
}
