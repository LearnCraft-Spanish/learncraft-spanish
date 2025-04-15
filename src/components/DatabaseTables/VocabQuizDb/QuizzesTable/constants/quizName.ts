export interface QuizNameObj {
  quizName: string;
  code: string;
}

export const quizNames: QuizNameObj[] = [
  { quizName: 'Spanish in One Month', code: 'si1m' },
  { quizName: 'LearnCraft Spanish', code: 'lcsp' },
  { quizName: 'LearnCraft Spanish Extended', code: 'lcspx' },
  { quizName: 'Master Ser vs Estar', code: 'ser-estar' },
  { quizName: 'Post-1MC Cohort', code: 'post-1mc' },
];

export interface QuizSubNameObj {
  quizName: string;
  quizNumber: number;
}
export const serVsEstarQuizSubNames: QuizSubNameObj[] = [
  { quizName: 'Short Quiz', quizNumber: 0 },
  { quizName: 'Good/Well', quizNumber: 1 },
  { quizName: 'Adjectives', quizNumber: 2 },
  { quizName: 'Prepositions', quizNumber: 3 },
  { quizName: 'Adverbs', quizNumber: 4 },
  { quizName: 'Actions', quizNumber: 5 },
  { quizName: 'Right and Wrong', quizNumber: 6 },
  { quizName: 'Events', quizNumber: 7 },
  { quizName: 'Long Quiz', quizNumber: 8 },
  { quizName: 'Long Quiz (Everything)', quizNumber: 9 },
];
