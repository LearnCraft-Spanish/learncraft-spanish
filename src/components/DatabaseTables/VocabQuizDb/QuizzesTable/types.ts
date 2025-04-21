import type { Quiz } from 'src/types/interfaceDefinitions';

export type EditableQuiz = Quiz;

export interface QuizObjForUpdate {
  quizNickname: string;
  recordId: number;
}

// new quiz has no recordId

export interface NewQuiz {
  quizNickname: string;
}
