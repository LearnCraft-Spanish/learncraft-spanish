export interface QbQuiz {
  recordId: number;
  quizNickname: string;
  published: boolean;

  relatedQuizGroup: number;
  quizGroupName: string;
}

export interface QuizGroup {
  recordId: number;
  name: string;
  urlSlug: string;
  published: boolean;

  relatedProgram: number;
  programName: string;
}
