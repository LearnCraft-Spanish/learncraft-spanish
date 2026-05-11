// QbQuiz and QuizGroup have been replaced by AdminQuizRecord and AdminQuizGroup
// from @learncraft-spanish/shared. These aliases remain for any code not yet migrated.
export type {
  AdminQuizRecord as QbQuiz,
  AdminQuizGroup as QuizGroup,
} from '@learncraft-spanish/shared';

export interface Lesson {
  recordId: number;
  lesson: string;
  lessonNumber: number;

  programName: string;
  relatedProgram: number;

  published: boolean;
}
